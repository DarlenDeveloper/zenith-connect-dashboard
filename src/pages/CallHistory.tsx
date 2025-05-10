import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  PhoneCall, Calendar, Clock, User, BarChart, Phone,
  Search, Filter, Eye, CheckCircle, Download, 
  AlertCircle, ArrowUp, ArrowDown, AlertTriangle, XCircle,
  Trash2, MoreHorizontal
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
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { logUserAction, LogActions } from "@/utils/user-logs";
import { Spinner } from "@/components/ui/spinner";
import { Loading } from "@/components/ui/loading";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import NoUserSelected from "@/components/NoUserSelected";

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
  const { selectedUser, userRequired } = useUser();
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [filteredCallLogs, setFilteredCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [sortField, setSortField] = useState<string>("call_datetime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [avgDuration, setAvgDuration] = useState<number | null>(null);

  // If user selection is required but none is selected, show the NoUserSelected component
  if (userRequired && !selectedUser) {
    return <NoUserSelected />;
  }

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
      
      // Apply date filter if dates are selected
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        query = query.gte('call_datetime', fromDate.toISOString());
      }
      
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('call_datetime', toDate.toISOString());
      }
        
      query = query.order(sortField, { ascending: sortDirection === "asc" });

      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      const fetchedLogs = data || [];
      setCallLogs(fetchedLogs);
      setFilteredCallLogs(fetchedLogs);
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
    fetchAverageDuration();

    const callsSubscription = supabase
      .channel('custom-calls-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calls' },
        (payload) => {
          console.log('Change received!', payload);
          fetchCallLogs();
          fetchAverageDuration();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callsSubscription);
    };
  }, [user, statusFilter, sortField, sortDirection, dateRange]);
  
  // Effect to filter call logs based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCallLogs(callLogs);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = callLogs.filter(call => {
      const callerNumber = (call.caller_number || "").toLowerCase();
      const notes = (call.notes || "").toLowerCase();
      const summary = (call.issue_summary || "").toLowerCase();
      const status = call.status.toLowerCase();
      
      return (
        callerNumber.includes(query) ||
        notes.includes(query) ||
        summary.includes(query) ||
        status.includes(query) ||
        formatDate(call.call_datetime).toLowerCase().includes(query)
      );
    });
    
    setFilteredCallLogs(filtered);
  }, [searchQuery, callLogs]);

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
      
      await logUserAction(
        LogActions.UPDATE_CALL_STATUS,
        { 
          call_id: id,
          newStatus: newStatus,
          table: 'calls'
        }
      );
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

      if (trimmedNewNotes !== (originalNotes || "").trim()) {
        await logUserAction(
          LogActions.SAVE_CALL_NOTES,
          { 
            call_id: selectedCall.id,
            notesUpdated: true,
            table: 'calls'
          }
        );
      }
    } catch (error: any) {
      console.error("Error saving notes:", error);
      toast.error(`Failed to save notes: ${error.message}`);
    }
  };

  const flagTechnicalIssue = async (call: CallLog) => {
    if (!selectedUser) {
      toast.error("Please select an active user from the header dropdown before flagging issues.");
      return;
    }

    try {
      // Create a new technical issue record
      const { data: issueData, error: issueError } = await supabase
        .from('technical_issues')
        .insert({
          description: call.notes || `Technical issue reported for call ${call.id}`,
          status: 'Open',
          priority: "Medium",
          reported_by: user?.id,
          user_id: user?.id,
          call_id: call.id
        })
        .select('id')
        .single();
        
      if (issueError) throw issueError;
      
      let newIssueId = issueData?.id;
      toast.success(`Flagged call for technical review (User: ${selectedUser.name}).`);
      
      await logUserAction(
        LogActions.FLAG_TECHNICAL_ISSUE,
        { 
          call_id: call.id,
          issue_id: newIssueId,
          table: 'technical_issues'
        }
      );

      if (newIssueId) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: user?.id,
            type: 'tech_issue_flagged',
            title: 'New Technical Issue Flagged',
            message: `Issue flagged for call from ${call.caller_number || 'Unknown'} by User ${selectedUser.name}`,
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

  const handleDeleteCall = (id: string) => {
    setSelectedCallId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCall = async () => {
    if (!selectedCallId) return;
    
    try {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', selectedCallId);
        
      if (error) throw error;
      
      toast.success("Call record deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchCallLogs();
      
      await logUserAction(
        LogActions.DELETE_CALL,
        { 
          call_id: selectedCallId,
          table: 'calls'
        }
      );
    } catch (error: any) {
      console.error("Error deleting call:", error);
      toast.error(`Failed to delete call: ${error.message}`);
    }
  };

  const totalCalls = filteredCallLogs.length;
  const resolvedCalls = filteredCallLogs.filter(call => call.status === "Resolved").length;
  const resolutionRate = totalCalls > 0 ? Math.round((resolvedCalls / totalCalls) * 100) : 0;
  
  // Format the average duration for display
  const formattedAvgDuration = avgDuration ? 
    `${Math.floor(avgDuration)}:${Math.round((avgDuration % 1) * 60).toString().padStart(2, '0')}` : 
    "N/A";

  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined });
    setIsDateFilterOpen(false);
  };

  const applyDateFilter = () => {
    // Filter is automatically applied when dateRange changes via the useEffect
    setIsDateFilterOpen(false);
    
    if (dateRange.from || dateRange.to) {
      const fromText = dateRange.from ? format(dateRange.from, 'PP') : 'Any';
      const toText = dateRange.to ? format(dateRange.to, 'PP') : 'Any';
      toast.success(`Date filter applied: ${fromText} - ${toText}`);
    }
  };

  const getDateFilterLabel = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MM/dd/yyyy')} - ${format(dateRange.to, 'MM/dd/yyyy')}`;
    } else if (dateRange.from) {
      return `From ${format(dateRange.from, 'MM/dd/yyyy')}`;
    } else if (dateRange.to) {
      return `Until ${format(dateRange.to, 'MM/dd/yyyy')}`;
    } else {
      return "Filter by Date";
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Function to fetch the average call duration
  const fetchAverageDuration = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc(
        'get_average_call_duration',
        { p_user_id: user.id }
      );
      
      if (error) throw error;
      
      setAvgDuration(data || null);
    } catch (error: any) {
      console.error("Error fetching average call duration:", error);
      setAvgDuration(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full px-4 py-4 md:px-6 lg:px-8">
        <header className="h-16 shrink-0 bg-white flex items-center px-4 sm:px-6 justify-between border-b border-gray-100 shadow-sm rounded-t-lg">
          <div className="flex items-center">
            <PhoneCall className="mr-2 h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Call History</h1>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant={dateRange.from || dateRange.to ? "default" : "outline"} 
                  size="sm"
                  className={dateRange.from || dateRange.to ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {getDateFilterLabel()}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filter Calls by Date Range</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-4">
                    <CalendarComponent
                      mode="range"
                      selected={dateRange}
                      onSelect={(value) => setDateRange(value || { from: undefined, to: undefined })}
                      className="mx-auto"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={clearDateFilter}>Clear</Button>
                  <Button onClick={applyDateFilter} className="bg-blue-600 hover:bg-blue-700">Apply Filter</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto bg-white rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Calls</p>
                  <p className="text-3xl font-bold">{totalCalls}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Phone className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium mb-1">Avg. Duration</p>
                  <p className="text-3xl font-bold">{formattedAvgDuration}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {avgDuration !== null ? "Overall average" : "No data available"}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">Resolution Rate</p>
                  <p className="text-3xl font-bold">{resolutionRate}%</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
            
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative grow md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search calls..."
                    className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
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
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
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
                      <TableCell colSpan={5} className="h-52">
                        <div className="flex items-center justify-center h-full">
                          <Loading text="Loading call data" size="md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCallLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                        {searchQuery ? 
                          `No calls matching "${searchQuery}" found.` : 
                          `No ${statusFilter === "all" ? "" : statusFilter.toLowerCase()} calls found.`
                        }
                      </TableCell>
                    </TableRow>
                  ) :
                    filteredCallLogs.map((call) => (
                      <TableRow key={call.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium">{call.caller_number || 'Unknown'}</TableCell>
                        <TableCell>{formatDate(call.call_datetime)}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="flex items-center">
                            <div className="relative group cursor-pointer">
                              <div className="max-w-xs truncate">
                                {call.notes || "No notes available"}
                              </div>
                              {call.notes && call.notes.length > 50 && (
                                <div className="fixed z-50 invisible group-hover:visible bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-96 max-h-80 overflow-y-auto" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)' }}>
                                  <div className="font-medium text-sm mb-2 text-blue-600">Call Notes:</div>
                                  <div className="whitespace-pre-wrap text-sm">{call.notes}</div>
                                </div>
                              )}
                            </div>
                            {call.notes && call.notes.length > 50 && (
                              <Button 
                                variant="ghost" 
                                className="h-6 w-6 p-0 ml-2" 
                                onClick={() => openNotesDialog(call)}
                              >
                                <span className="sr-only">View full notes</span>
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={call.status === "Resolved" ? "default" : call.status === "Unresolved" ? "destructive" : "secondary"}
                            className={
                              call.status === "Resolved" 
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-none" 
                                : call.status === "Unresolved" 
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border-none"
                                : "bg-black bg-opacity-10 text-gray-800 hover:bg-opacity-20 border-none"
                            }
                          >
                            {call.status === 'Unresolved' ? 'Pending' : call.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem
                                onClick={() => openNotesDialog(call)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Call</span>
                              </DropdownMenuItem>

                              {call.status !== "Resolved" && (
                                <DropdownMenuItem
                                  onClick={() => updateCallStatus(call.id, "Resolved")}
                                  className="cursor-pointer"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Mark Resolved</span>
                                </DropdownMenuItem>
                              )}

                              {call.status !== "Needs Review" && (
                                <DropdownMenuItem
                                  onClick={() => updateCallStatus(call.id, "Needs Review")}
                                  className="cursor-pointer"
                                >
                                  <AlertCircle className="mr-2 h-4 w-4" />
                                  <span>Needs Review</span>
                                </DropdownMenuItem>
                              )}

                              {call.status !== "Unresolved" && (
                                <DropdownMenuItem
                                  onClick={() => updateCallStatus(call.id, "Unresolved")}
                                  className="cursor-pointer"
                                >
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  <span>Mark Pending</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem 
                                onClick={() => flagTechnicalIssue(call)}
                                className="cursor-pointer"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Flag Technical Issue</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem 
                                onClick={() => handleDeleteCall(call.id)}
                                className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>

      {/* Notes Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5 text-blue-600" />
              {selectedCall ? (
                <span>Call Notes - {selectedCall.caller_number || 'Unknown'}</span>
              ) : (
                <span>View Call</span>
              )}
            </DialogTitle>
            {selectedCall && selectedCall.call_datetime && (
              <div className="text-sm text-gray-500 mt-1">
                Call Date: {formatDate(selectedCall.call_datetime)}
              </div>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="bg-gray-50 p-3 mb-3 rounded-md">
              <div className="text-sm font-medium text-gray-700 mb-2">Call Status: 
                <Badge 
                  variant={selectedCall?.status === "Resolved" ? "default" : selectedCall?.status === "Unresolved" ? "destructive" : "secondary"}
                  className="ml-2"
                >
                  {selectedCall?.status === 'Unresolved' ? 'Pending' : selectedCall?.status}
                </Badge>
              </div>
              {selectedCall?.issue_summary && (
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Issue Summary:</span> {selectedCall.issue_summary}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <Textarea
                className="min-h-[250px] text-base w-full h-full resize-none font-mono"
                placeholder="Enter notes about this call..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2 flex justify-between">
              <span>Character count: {editNotes.length}</span>
              <span>Line count: {editNotes.split('\n').length}</span>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNotes} className="bg-blue-600 hover:bg-blue-700">
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p>Are you sure you want to delete this call record? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCall}
              className="bg-gray-900 hover:bg-gray-800 border-none"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CallHistory;
