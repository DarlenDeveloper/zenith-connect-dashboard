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
}

// Interface for the context value
interface AgentContextType {
  agents: Agent[];
  selectedAgent: Agent | null;
  setSelectedAgentId: (agentId: string | null) => void;
  loadingAgents: boolean;
}

// Create the context
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Define the provider component
export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentIdState] = useState<string | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Load initial selected agent from localStorage
  useEffect(() => {
    const storedAgentId = localStorage.getItem('selectedAgentId');
    if (storedAgentId) {
      setSelectedAgentIdState(storedAgentId);
    }
  }, []);

  // Fetch agents when user logs in
  useEffect(() => {
    if (!user) {
      setAgents([]);
      setSelectedAgentIdState(null); // Clear selection on logout
      localStorage.removeItem('selectedAgentId');
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

        // Ensure the stored selected agent is valid and active, otherwise select the first one or none
        const currentSelectedId = localStorage.getItem('selectedAgentId');
        const isValidSelection = fetchedAgents.some(agent => agent.id === currentSelectedId);
        
        if (isValidSelection) {
            setSelectedAgentIdState(currentSelectedId);
        } else if (fetchedAgents.length > 0) {
            // If invalid selection or no selection, default to the first active agent
            setSelectedAgentIdState(fetchedAgents[0].id);
            localStorage.setItem('selectedAgentId', fetchedAgents[0].id);
        } else {
            // No active agents found
            setSelectedAgentIdState(null);
            localStorage.removeItem('selectedAgentId');
        }

      } catch (error: any) {
        toast.error(`Failed to load agents: ${error.message}`);
        setAgents([]); // Clear agents on error
        setSelectedAgentIdState(null);
        localStorage.removeItem('selectedAgentId');
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();

    // Optional: Add real-time subscription for agents table if needed

  }, [user]);

  // Function to update selected agent ID and store it
  const setSelectedAgentId = useCallback((agentId: string | null) => {
    setSelectedAgentIdState(agentId);
    if (agentId) {
      localStorage.setItem('selectedAgentId', agentId);
    } else {
      localStorage.removeItem('selectedAgentId');
    }
  }, []);

  // Find the selected agent object based on the ID
  const selectedAgent = useMemo(() => {
    return agents.find(agent => agent.id === selectedAgentId) || null;
  }, [agents, selectedAgentId]);

  // Memoize the context value
  const value = useMemo(() => ({
    agents,
    selectedAgent,
    setSelectedAgentId,
    loadingAgents
  }), [agents, selectedAgent, setSelectedAgentId, loadingAgents]);

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