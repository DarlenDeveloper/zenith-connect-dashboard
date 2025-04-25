import { useEffect, useState } from "react";
import { useAgent, Agent } from "@/contexts/AgentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Users, Search } from "lucide-react";
import AgentPasswordDialog from "@/components/AgentPasswordDialog";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";

const NoAgentSelected = () => {
  const { agents, loadingAgents } = useAgent();
  const [selectedAgentForAuth, setSelectedAgentForAuth] = useState<Agent | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgentForAuth(agent);
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordVerified = (success: boolean) => {
    if (success) {
      // The agent context has already been updated with the selected agent
      // Just close the dialog
      setIsPasswordDialogOpen(false);
    }
  };

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent => 
    searchTerm === "" || 
    agent.agent_ref_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 flex-1 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full mx-auto shadow-lg border-none">
        <CardHeader className="text-center pb-0">
          <CardTitle className="text-2xl">Select an Agent to Continue</CardTitle>
          <p className="text-gray-500 mt-1">
            You must select and authenticate as an agent before using this feature
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingAgents ? (
            <div className="py-8 flex justify-center">
              <Loading text="Loading agents" size="md" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-4 inline-flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No agents found. Please create an agent first.</p>
              <Button 
                onClick={() => window.location.href = '/agents'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Agents Management
              </Button>
            </div>
          ) : (
            <div>
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
              
              {/* List of agents with scrolling */}
              <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto pr-1">
                {filteredAgents.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No agents match your search
                  </div>
                ) : (
                  filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                      onClick={() => handleAgentClick(agent)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                          {agent.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">{agent.name}</h3>
                          <p className="text-sm text-gray-500">{agent.agent_ref_id}</p>
                        </div>
                        <Button
                          className="ml-auto bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Select
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAgentForAuth && (
        <AgentPasswordDialog
          isOpen={isPasswordDialogOpen}
          onClose={() => setIsPasswordDialogOpen(false)}
          agent={selectedAgentForAuth}
          onVerify={handlePasswordVerified}
        />
      )}
    </div>
  );
};

export default NoAgentSelected; 