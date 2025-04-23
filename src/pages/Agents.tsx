import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgent, Agent } from "@/contexts/AgentContext";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle, Edit, Trash2 } from "lucide-react";
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
  const { agents, loadingAgents } = useAgent(); // Get agents from context
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddAgentDialogOpen, setIsAddAgentDialogOpen] = useState(false);

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

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-gray-500" />
            <h1 className="text-xl font-medium">Agents Management</h1>
          </div>
          {/* Add Agent Button triggers Dialog */}
          <Dialog open={isAddAgentDialogOpen} onOpenChange={setIsAddAgentDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add New Agent</Button>
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Agent'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Main content - Agent List Table */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle>Your Agents</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAgents ? (
                <p className="py-8 text-center text-gray-500">Loading agents...</p>
              ) : (
                agents.length === 0 ? (
                  <div className="h-40 text-center flex flex-col items-center justify-center">
                    <Users className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">No agents found. Add one using the button above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-2 sm:px-4">
                    {agents.map((agent) => (
                      <Card 
                        key={agent.id} 
                        className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-sm font-medium">{agent.agent_ref_id}</div>
                          </div>
                          <div className="text-xs text-gray-400">
                            <Badge variant={agent.is_active ? "default" : "secondary"} className={agent.is_active ? 'bg-green-100 text-green-800' : ''}>
                              {agent.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 py-3">
                          <div className="text-sm text-gray-700 font-medium mb-1">{agent.name}</div>
                          <div className="text-xs text-gray-500">{agent.email || 'No email'}</div>
                          <div className="text-xs text-gray-500">{agent.phone_number || 'No phone number'}</div>
                          <div className="flex justify-end mt-4 space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditAgent(agent)} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAgent(agent)} className="h-8 w-8 text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </CardContent>
                      </Card>
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
