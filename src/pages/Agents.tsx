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
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" {...register('name')} className="col-span-3" />
                  </div>
                  {errors.name && <p className="col-start-2 col-span-3 text-xs text-red-600">{errors.name.message}</p>}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" {...register('email')} className="col-span-3" />
                  </div>
                  {errors.email && <p className="col-start-2 col-span-3 text-xs text-red-600">{errors.email.message}</p>}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone_number" className="text-right">Phone</Label>
                    <Input id="phone_number" placeholder="Optional" {...register('phone_number')} className="col-span-3" />
                  </div>
                  {errors.phone_number && <p className="col-start-2 col-span-3 text-xs text-red-600">{errors.phone_number.message}</p>}
                </div>
                <DialogFooter>
                  {/* Optional: Add a close button if needed, though clicking outside works */}
                  {/* <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose> */}
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
          <Card>
            <CardHeader>
              <CardTitle>Your Agents</CardTitle>
              {/* Optional: Add search/filter controls here later */}
            </CardHeader>
            <CardContent>
              {loadingAgents ? (
                <p>Loading agents...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="h-24 text-center">No agents found. Add one using the button above.</TableCell></TableRow>
                    ) : (
                      agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">{agent.agent_ref_id}</TableCell>
                          <TableCell>{agent.name}</TableCell>
                          <TableCell>{agent.phone_number || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={agent.is_active ? "default" : "secondary"} className={agent.is_active ? 'bg-green-100 text-green-800' : ''}>
                              {agent.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditAgent(agent)} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAgent(agent)} className="h-8 w-8 text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                            {/* Add toggle active button later */}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Agents;
