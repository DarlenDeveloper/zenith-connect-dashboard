import { UserCheck, AlertTriangle, Search } from "lucide-react";
import { useAgent } from "@/contexts/AgentContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AgentPasswordDialog from "./AgentPasswordDialog";
import { Input } from "@/components/ui/input";

interface AgentRequiredBannerProps {
  containerClassName?: string;
}

const AgentRequiredBanner = ({ containerClassName = "" }: AgentRequiredBannerProps) => {
  const { selectedAgent, agents, agentRequired } = useAgent();
  const [isSelectAgentOpen, setIsSelectAgentOpen] = useState(false);
  const [selectedAgentForAuth, setSelectedAgentForAuth] = useState<typeof agents[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Don't show the banner if agent is not required or if an agent is already selected
  if (!agentRequired || selectedAgent) {
    return null;
  }

  const handleAgentSelect = (agent: typeof agents[0]) => {
    setSelectedAgentForAuth(agent);
    setIsSelectAgentOpen(true);
  };

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent => 
    searchTerm === "" || 
    agent.agent_ref_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`bg-amber-50 border-b border-amber-200 py-2 px-4 ${containerClassName}`}>
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
          <span className="text-amber-800 font-medium">Agent authentication required for this action</span>
        </div>
        
        <div className="flex items-center gap-2">
          {agents && agents.length > 0 ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                onClick={() => setIsSelectAgentOpen(true)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Select Agent
              </Button>
              
              {isSelectAgentOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 max-h-[90vh]">
                    <h2 className="text-xl font-semibold mb-4">Select an Agent</h2>
                    <p className="text-gray-600 mb-4">Choose an agent to continue:</p>
                    
                    {/* Search input */}
                    <div className="mb-4 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by agent ID or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 py-2"
                      />
                    </div>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {filteredAgents.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          No agents match your search
                        </div>
                      ) : (
                        filteredAgents.map(agent => (
                          <div
                            key={agent.id}
                            className="p-3 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer flex items-center"
                            onClick={() => handleAgentSelect(agent)}
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                              {agent.name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">{agent.name}</div>
                              <div className="text-xs text-gray-500">{agent.agent_ref_id}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsSelectAgentOpen(false);
                          setSearchTerm("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
              onClick={() => window.location.href = '/agents'}
            >
              Create Agent
            </Button>
          )}
        </div>
      </div>
      
      {selectedAgentForAuth && (
        <AgentPasswordDialog
          isOpen={isSelectAgentOpen}
          onClose={() => {
            setIsSelectAgentOpen(false);
            setSelectedAgentForAuth(null);
            setSearchTerm("");
          }}
          agent={selectedAgentForAuth}
          onVerify={(success) => {
            if (success) {
              setIsSelectAgentOpen(false);
              setSelectedAgentForAuth(null);
              setSearchTerm("");
            }
          }}
        />
      )}
    </div>
  );
};

export default AgentRequiredBanner; 