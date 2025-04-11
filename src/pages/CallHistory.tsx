import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  PhoneCall, Calendar, Clock, User, BarChart, Phone,
  Search, Filter, FileEdit, CheckCircle, Download, 
  AlertCircle, ArrowUp, ArrowDown, AlertTriangle, XCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAgent } from "@/contexts/AgentContext";
import { logAction } from "@/lib/logging";

interface CallLog {
  id: string;
  caller_number: string | null;
  call_datetime: string;
  duration?: string;
  issue_summary?: string | null;
  status: string;
  notes: string | null;
}

const CallHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedAgent } = useAgent();
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [sortField, setSortField] = useState<string>("call_datetime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('calls')
        .select('*');
        
      const dbStatusFilter = statusFilter === 'Pending' ? 'Unresolved' : statusFilter;

      if (dbStatusFilter !== 'all') {
        query = query.eq('status', dbStatusFilter);
      }
        
      query = query.order(sortField, { ascending: sortDirection === "asc" });

      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      setCallLogs(data || []);
    } catch (error: any) {
      console.error("Error fetching call logs:", error);
      toast.error(`Failed to load call history: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchCallLogs();

    const callsSubscription = supabase
      .channel('custom-calls-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calls' },
        (payload) => {
          console.log('Change received!', payload);
          fetchCallLogs(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callsSubscription);
    };
  }, [user, statusFilter, sortField, sortDirection]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: true
      }).format(date);
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const updateCallStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('calls')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      toast.success(`Call status updated to ${newStatus}`);
      
      if (user) {
        await logAction({
          userId: user.id,
          agentId: selectedAgent?.id || null,
          actionType: 'UPDATE_CALL_STATUS',
          targetTable: 'calls',
          targetId: id,
          details: { newStatus: newStatus }
        });
      }
    } catch (error: any) {
      console.error("Error updating call status:", error);
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  const openNotesDialog = (call: CallLog) => {
    setSelectedCall(call);
    setEditNotes(call.notes || "");
    setIsNoteDialogOpen(true);
  };

  const saveNotes = async () => {
    if (!selectedCall) return;
    
    const originalNotes = selectedCall.notes || "";
    const trimmedNewNotes = editNotes.trim();

    try {
      const { error } = await supabase
        .from('calls')
        .update({ notes: editNotes })
        .eq('id', selectedCall.id);
        
      if (error) throw error;
      
      setIsNoteDialogOpen(false);
      toast.success("Notes saved successfully");

      if (user && trimmedNewNotes !== (originalNotes || "").trim()) {
        await logAction({
          userId: user.id,
          agentId: selectedAgent?.id || null,
          actionType: 'SAVE_CALL_NOTES',
          targetTable: 'calls',
          targetId: selectedCall.id,
          details: { 
            previousNotesLength: originalNotes.length, 
            newNotesLength: editNotes.length 
          } 
        });
      }
    } catch (error: any) {
      console.error("Error saving notes:", error);
      toast.error(`Failed to save notes: ${error.message}`);
    }
  };

  const flagTechnicalIssue = async (call: CallLog) => {
    if (!user) {
      toast.error("You must be logged in to flag issues.");
      return;
    }
    if (!selectedAgent) {
      toast.error("Please select an active agent from the header dropdown before flagging issues.");
      return;
    }
    
    let newIssueId: string | undefined = undefined;
    
    try {
      const { data: issueData, error: issueError } = await supabase
        .from('technical_issues')
        .insert({
          user_id: user.id,
          call_id: call.id,
          title: `Tech Issue: Call ${call.caller_number || 'Unknown'}`,
          description: call.notes || "Call flagged for technical review.",
          status: "Open",
          priority: "Medium",
          reported_by: user.id,
          acting_agent_id: selectedAgent.id
        })
        .select('id')
        .single();
        
      if (issueError) throw issueError;
      
      newIssueId = issueData?.id;
      toast.success(`Flagged call for technical review (Agent: ${selectedAgent.name}).`);
      
      await logAction({
        userId: user.id,
        agentId: selectedAgent.id,
        actionType: 'FLAG_TECHNICAL_ISSUE',
        targetTable: 'technical_issues',
        targetId: newIssueId,
        details: { flaggedCallId: call.id } 
      });

      if (newIssueId) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'tech_issue_flagged',
            title: 'New Technical Issue Flagged',
            message: `Issue flagged for call from ${call.caller_number || 'Unknown'} by Agent ${selectedAgent.name}`,
            target_table: 'technical_issues',
            target_id: newIssueId
          });
        
        if (notificationError) {
          console.error("Error creating notification for flagged issue:", notificationError);
        }
      }

      navigate(`/technical?techIssueId=${newIssueId || call.id}`);

    } catch (error: any) {
      console.error("Error flagging technical issue:", error);
      if (error.message.includes('row-level security policy')) {
        toast.error(`Failed to flag issue: Permission denied. Please check RLS setup.`);
      } else {
        toast.error(`Failed to flag issue: ${error.message}`);
      }
    }
  };

  const totalCalls = callLogs.length;
  const resolvedCalls = callLogs.filter(call => call.status === "Resolved").length;
  const resolutionRate = totalCalls > 0 ? Math.round((resolvedCalls / totalCalls) * 100) : 0;
  const formattedAvgDuration = "N/A";

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <div className="flex items-center">
            <PhoneCall className="mr-2 h-5 w-5 text-gray-500" />
            <h1 className="text-xl font-medium">Call History</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Filter by Date
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg border shadow-md">
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4 flex items-center shadow-sm">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Calls</div>
                  <div className="text-xl font-bold">{totalCalls}</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 flex items-center shadow-sm">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg. Duration</div>
                  <div className="text-xl font-bold">{formattedAvgDuration}</div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 flex items-center shadow-sm">
                <div className="bg-purple-100 rounded-full p-2 mr-3">
                  <BarChart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Resolution Rate</div>
                  <div className="text-xl font-bold">{resolutionRate}%</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex flex-wrap gap-3 items-center">
              <div className="relative grow md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calls..."
                  className="pl-9 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Status: {statusFilter === "all" ? "All" : statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Resolved")}>Resolved</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Needs Review")}>Needs Review</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("caller_number")}>
                      Caller Number
                      {sortField === "caller_number" && (
                        <span className="ml-1 inline-block">
                          {sortDirection === "asc" ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                        </span>
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("call_datetime")}>
                      Date & Time
                      {sortField === "call_datetime" && (
                        <span className="ml-1 inline-block">
                          {sortDirection === "asc" ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                        </span>
                      )}
                    </TableHead>
                    <TableHead className="min-w-[200px]">Notes / Summary</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                      Status
                      {sortField === "status" && (
                        <span className="ml-1 inline-block">
                          {sortDirection === "asc" ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                        </span>
                      )}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">Loading calls...</TableCell>
                    </TableRow>
                  ) : callLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No {statusFilter === "all" ? "" : statusFilter.toLowerCase()} calls found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    callLogs.map((call) => (
                      <TableRow key={call.id} className="hover:bg-gray-50">
                        <TableCell>{call.caller_number || 'Unknown'}</TableCell>
                        <TableCell>{formatDate(call.call_datetime)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {call.notes || "No notes available"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={call.status === "Resolved" ? "default" : call.status === "Unresolved" ? "destructive" : "secondary"}
                            className={call.status === "Resolved" ? "bg-green-100 text-green-800 border-green-200" 
                                     : call.status === "Unresolved" ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                     : "bg-blue-100 text-blue-800 border-blue-200"}
                          >
                            {call.status === 'Unresolved' ? 'Pending' : call.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => openNotesDialog(call)}
                            >
                              <FileEdit className="h-4 w-4" />
                              <span className="sr-only">Edit Notes</span>
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => flagTechnicalIssue(call)}
                              disabled={!selectedAgent}
                              title={selectedAgent ? "Flag for Technical Review" : "Select an agent first"}
                            >
                              <AlertTriangle className="h-4 w-4" />
                              <span className="sr-only">Flag Technical Issue</span>
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2">Status</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white">
                                <DropdownMenuItem onClick={() => updateCallStatus(call.id, "Resolved")}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Mark Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateCallStatus(call.id, "Unresolved")}>
                                  <Clock className="h-4 w-4 mr-2 text-yellow-600" /> Mark Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateCallStatus(call.id, "Needs Review")}>
                                  <AlertCircle className="h-4 w-4 mr-2 text-blue-600" /> Mark Needs Review
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Call Notes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              className="min-h-[150px]"
              placeholder="Enter notes about this call..."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CallHistory;
