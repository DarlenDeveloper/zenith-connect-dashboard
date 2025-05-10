import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAgent, Agent } from "@/contexts/AgentContext";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle, Edit, Trash2, Phone, KeyRound, UserCheck, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";

// Zod schema for new agent form - Updated
const newAgentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }), // Added email
  phone_number: z.string().optional(), // Optional phone number
  pin: z.string().length(4, { message: "PIN must be exactly 4 digits." }).regex(/^\d{4}$/, { message: "PIN must be 4 digits." })
});
type NewAgentFormData = z.infer<typeof newAgentSchema>;

const Agents = () => {
  const { user } = useAuth();
  const { agents, loadingAgents, setAgentRequired } = useAgent(); // Get agents and setAgentRequired from context
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddAgentDialogOpen, setIsAddAgentDialogOpen] = useState(false);

  // Set agent not required when entering Agents page
  useEffect(() => {
    setAgentRequired(false);
    
    // Restore the requirement when leaving the page
    return () => {
      setAgentRequired(true);
    };
  }, [setAgentRequired]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewAgentFormData>({
    resolver: zodResolver(newAgentSchema),
  });

  // Handle form submission to add a new agent - Updated
  const handleAddAgent: SubmitHandler<NewAgentFormData> = async (formData) => {
    if (!user) return toast.error("User not found");
    setIsSubmitting(true);
    try {
      // 1. Get the next sequence number
      const { data: sequenceData, error: sequenceError } = await supabase.rpc('get_next_agent_sequence');
      
      if (sequenceError) throw new Error(`Failed to get next agent ID sequence: ${sequenceError.message}`);
      if (sequenceData === null) throw new Error('Could not determine next agent ID sequence.');

      const nextSequence = sequenceData as number;
      
      // 2. Format the new agent_ref_id (e.g., AUD0001)
      //    Using first 3 letters of user's email prefix or 'AGN' as default prefix
      const emailPrefix = user.email?.split('@')[0]?.substring(0, 3).toUpperCase() || 'AGN';
      const agentRefId = `${emailPrefix}${String(nextSequence).padStart(4, '0')}`; // Format to 4 digits

      // 3. Insert the agent with the generated ID
      const { error: insertError } = await supabase
        .from('agents')
        .insert({
          ...formData,
          agent_ref_id: agentRefId, // Use the generated ID
          user_id: user.id,
          is_active: true,
        });

      if (insertError) {
        // Handle potential race condition if sequence was taken between rpc call and insert
        if (insertError.message.includes('duplicate key value violates unique constraint')) {
          throw new Error(`Generated Agent ID '${agentRefId}' was already taken. Please try again.`);
        } else {
          throw insertError; // Re-throw other insert errors
        }
      }
      
      toast.success(`Agent ${formData.name} added successfully with ID ${agentRefId}!`);
      reset();
      setIsAddAgentDialogOpen(false);
      // Consider forcing context refetch if real-time isn't setup for agents

    } catch (error: any) {
      toast.error(`Failed to add agent: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // TODO: Implement Edit/Delete/Toggle Active functions later
  const handleEditAgent = (agent: Agent) => { toast.info("Edit functionality not yet implemented."); };
  const handleDeleteAgent = (agent: Agent) => { toast.info("Delete functionality not yet implemented."); };
  const handleToggleActive = (agent: Agent) => { toast.info("Toggle active status not yet implemented."); };

  // Stats counts
  const activeAgentsCount = agents.filter(agent => agent.is_active).length;
  const inactiveAgentsCount = agents.filter(agent => !agent.is_active).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <header className="h-16 shrink-0 bg-white flex items-center px-6 justify-between border-b border-gray-100 shadow-sm">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Agents Management</h1>
          </div>
          {/* Add Agent Button triggers Dialog */}
          <Dialog open={isAddAgentDialogOpen} onOpenChange={setIsAddAgentDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Agent</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleAddAgent)}>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input id="phone_number" placeholder="Optional" {...register('phone_number')} />
                    {errors.phone_number && <p className="text-xs text-red-600">{errors.phone_number.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN</Label>
                    <Input 
                      id="pin" 
                      type="password" 
                      placeholder="4-digit PIN" 
                      {...register('pin')} 
                      maxLength={4}
                      inputMode="numeric"
                    />
                    <p className="text-xs text-gray-500">Create a 4-digit PIN for agent authentication</p>
                    {errors.pin && <p className="text-xs text-red-600">{errors.pin.message}</p>}
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button variant="outline" type="button" onClick={() => setIsAddAgentDialogOpen(false)} className="mr-2">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? 'Adding...' : 'Add Agent'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <main className="flex-1 overflow-auto bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Agents</p>
                  <p className="text-3xl font-bold">{agents.length}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium mb-1">Active Agents</p>
                  <p className="text-3xl font-bold">{activeAgentsCount}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">Inactive Agents</p>
                  <p className="text-3xl font-bold">{inactiveAgentsCount}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Filter className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-white rounded-xl shadow-md overflow-hidden border-none">
            <CardHeader className="pb-0">
              <CardTitle>Manage Your Agents</CardTitle>
              <CardDescription>View and manage all agents in your organization</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingAgents ? (
                <div className="min-h-[300px] flex items-center justify-center">
                  <Loading text="Loading agents" size="md" />
                </div>
              ) : (
                agents.length === 0 ? (
                  <div className="min-h-[300px] flex flex-col items-center justify-center py-10">
                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-800 mb-2">No Agents Found</h2>
                    <p className="text-gray-600 mb-6 max-w-md text-center">
                      You haven't added any agents yet. Add an agent to get started with call management.
                    </p>
                    <Button 
                      onClick={() => setIsAddAgentDialogOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Agent
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent) => (
                      <div 
                        key={agent.id} 
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow duration-200 border border-gray-100"
                      >
                        <div className="p-5 border-b border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                {agent.name.charAt(0)}
                              </div>
                              <div className="ml-3 max-w-[150px] overflow-hidden">
                                <h3 className="font-semibold text-gray-900 truncate" title={agent.name}>{agent.name}</h3>
                                <p className="text-sm text-gray-500 truncate" title={agent.agent_ref_id}>{agent.agent_ref_id}</p>
                              </div>
                            </div>
                            <Badge 
                              variant={agent.is_active ? "default" : "secondary"}
                              className={
                                agent.is_active 
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-none" 
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-none"
                              }
                            >
                              {agent.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {agent.phone_number || 'No phone number'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <KeyRound className="h-4 w-4 mr-2 text-gray-400" />
                            PIN: ••••
                          </div>
                        </div>
                        <div className="px-5 py-3 bg-gray-50 flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditAgent(agent)} 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteAgent(agent)} 
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Agents;
