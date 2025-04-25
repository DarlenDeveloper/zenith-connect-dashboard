import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext'; // Assuming AuthContext is in the same directory
import { toast } from 'sonner';

// Interface for Agent data from DB
export interface Agent {
  id: string; // UUID
  user_id: string; // Owner user UUID
  agent_ref_id: string; // e.g., AUD0001
  name: string;
  phone_number: string | null;
  is_active: boolean;
  created_at: string;
  pin: string; // 4-digit PIN for agent authentication
}

// Interface for the context value
interface AgentContextType {
  agents: Agent[];
  selectedAgent: Agent | null;
  setSelectedAgentId: (agentId: string | null) => void;
  loadingAgents: boolean;
  authenticateAgent: (agentId: string, password: string) => Promise<boolean>;
  authenticatedAgentIds: string[];
  agentRequired: boolean;
  setAgentRequired: (required: boolean) => void;
}

// Create the context
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Define the provider component
export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentIdState] = useState<string | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(true);
  // Track which agents are authenticated
  const [authenticatedAgentIds, setAuthenticatedAgentIds] = useState<string[]>([]);
  // Track if agent authentication is required
  const [agentRequired, setAgentRequired] = useState<boolean>(true);

  // Load initial selected agent from sessionStorage if it exists in authenticated agents
  useEffect(() => {
    // Check session storage for authenticated agents
    const storedAuthenticatedAgents = sessionStorage.getItem('authenticatedAgentIds');
    if (storedAuthenticatedAgents) {
      try {
        const parsedIds = JSON.parse(storedAuthenticatedAgents);
        if (Array.isArray(parsedIds)) {
          setAuthenticatedAgentIds(parsedIds);
        }
      } catch (e) {
        // Invalid JSON, clear the item
        sessionStorage.removeItem('authenticatedAgentIds');
      }
    }

    const storedAgentId = sessionStorage.getItem('selectedAgentId');
    if (storedAgentId) {
      setSelectedAgentIdState(storedAgentId);
    }
  }, []);

  // Fetch agents when user logs in
  useEffect(() => {
    if (!user) {
      setAgents([]);
      setSelectedAgentIdState(null); // Clear selection on logout
      setAuthenticatedAgentIds([]); // Clear authenticated agents
      sessionStorage.removeItem('selectedAgentId');
      sessionStorage.removeItem('authenticatedAgentIds');
      setLoadingAgents(false);
      return;
    }

    const fetchAgents = async () => {
      setLoadingAgents(true);
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', user.id) // RLS also handles this, but explicit check is fine
          .eq('is_active', true) // Only fetch active agents
          .order('name', { ascending: true });

        if (error) throw error;
        
        const fetchedAgents = data || [];
        setAgents(fetchedAgents);

        // Ensure the stored selected agent is valid, active, and authenticated
        const currentSelectedId = sessionStorage.getItem('selectedAgentId');
        const isValidSelection = fetchedAgents.some(agent => 
          agent.id === currentSelectedId && authenticatedAgentIds.includes(agent.id)
        );
        
        if (isValidSelection) {
            setSelectedAgentIdState(currentSelectedId);
        } else {
            // If invalid selection, clear selection
            setSelectedAgentIdState(null);
            sessionStorage.removeItem('selectedAgentId');
        }

      } catch (error: any) {
        toast.error(`Failed to load agents: ${error.message}`);
        setAgents([]); // Clear agents on error
        setSelectedAgentIdState(null);
        sessionStorage.removeItem('selectedAgentId');
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();

    // Optional: Add real-time subscription for agents table if needed

  }, [user, authenticatedAgentIds]);

  // Function to authenticate agent with password
  const authenticateAgent = async (agentId: string, password: string): Promise<boolean> => {
    // Find the agent
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return false;

    // Validate the entered PIN against the agent's PIN in the database
    if (password === agent.pin) {
      // Only authentication for this browser session - won't affect other computers
      const newAuthenticatedAgents = [agentId];
      setAuthenticatedAgentIds(newAuthenticatedAgents);
      
      // Store authenticated agents in sessionStorage (only affects current browser session)
      sessionStorage.setItem('authenticatedAgentIds', JSON.stringify(newAuthenticatedAgents));
      
      // Automatically set this agent as the selected agent for this session
      setSelectedAgentIdState(agentId);
      sessionStorage.setItem('selectedAgentId', agentId);
      
      // Notify user about agent switch
      toast.success(`Agent ${agent.name} is now active`);
      
      return true;
    }
    
    return false;
  };

  // Function to update selected agent ID and store it
  const setSelectedAgentId = useCallback((agentId: string | null) => {
    // Only allow setting to an authenticated agent
    if (agentId && !authenticatedAgentIds.includes(agentId)) {
      // This shouldn't happen normally as the UI should prevent it,
      // but adding as a safeguard
      console.warn("Attempted to select an unauthenticated agent.");
      return;
    }
    
    setSelectedAgentIdState(agentId);
    if (agentId) {
      sessionStorage.setItem('selectedAgentId', agentId);
    } else {
      sessionStorage.removeItem('selectedAgentId');
    }
  }, [authenticatedAgentIds]);

  // Find the selected agent object based on the ID
  const selectedAgent = useMemo(() => {
    return agents.find(agent => agent.id === selectedAgentId) || null;
  }, [agents, selectedAgentId]);

  // Memoize the context value
  const value = useMemo(() => ({
    agents,
    selectedAgent,
    setSelectedAgentId,
    loadingAgents,
    authenticateAgent,
    authenticatedAgentIds,
    agentRequired,
    setAgentRequired
  }), [agents, selectedAgent, setSelectedAgentId, loadingAgents, authenticateAgent, authenticatedAgentIds, agentRequired]);

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

// Custom hook to use the Agent context
export const useAgent = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}; 