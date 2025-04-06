
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  PhoneCall, Calendar, Clock, User, BarChart, Phone,
  Search, Filter, FileEdit, CheckCircle, Download, 
  AlertCircle, ArrowUp, ArrowDown
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

interface CallLog {
  id: string;
  caller_number: string;
  call_datetime: string;
  duration: string;
  issue_summary: string | null;
  status: string;
  notes: string | null;
}

const CallHistory = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([
    { 
      id: "1", 
      caller_number: "+1 (555) 123-4567", 
      call_datetime: "2025-04-05T10:30:00Z", 
      duration: "4:32", 
      issue_summary: "Customer inquiring about subscription renewal options", 
      status: "Resolved", 
      notes: "Customer chose the annual plan with monthly payments" 
    },
    { 
      id: "2", 
      caller_number: "+1 (555) 234-5678", 
      call_datetime: "2025-04-05T13:15:00Z", 
      duration: "8:47", 
      issue_summary: "Technical issue with checkout process", 
      status: "Unresolved", 
      notes: "Escalated to technical team" 
    },
    { 
      id: "3", 
      caller_number: "+1 (555) 345-6789", 
      call_datetime: "2025-04-04T11:05:00Z", 
      duration: "3:18", 
      issue_summary: "Inquiry about product features", 
      status: "Resolved", 
      notes: null 
    },
    { 
      id: "4", 
      caller_number: "+1 (555) 456-7890", 
      call_datetime: "2025-04-04T09:45:00Z", 
      duration: "6:22", 
      issue_summary: "Requesting product demonstration", 
      status: "Resolved", 
      notes: "Scheduled a demo for next Tuesday" 
    },
    { 
      id: "5", 
      caller_number: "+1 (555) 567-8901", 
      call_datetime: "2025-04-03T16:30:00Z", 
      duration: "5:12", 
      issue_summary: "Billing discrepancy", 
      status: "Unresolved", 
      notes: "Waiting for finance department review" 
    },
  ]);

  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Function to format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Function to handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Function to update call status
  const updateCallStatus = (id: string, newStatus: string) => {
    // This will be updated to use Supabase later
    setCallLogs(callLogs.map(call => 
      call.id === id ? { ...call, status: newStatus } : call
    ));
    toast.success(`Call status updated to ${newStatus}`);
  };

  // Function to open notes dialog
  const openNotesDialog = (call: CallLog) => {
    setSelectedCall(call);
    setEditNotes(call.notes || "");
    setIsNoteDialogOpen(true);
  };

  // Function to save notes
  const saveNotes = async () => {
    if (!selectedCall) return;
    
    // This will be updated to use Supabase later
    setCallLogs(callLogs.map(call => 
      call.id === selectedCall.id ? { ...call, notes: editNotes } : call
    ));
    
    setIsNoteDialogOpen(false);
    toast.success("Notes saved successfully");
  };

  // Function to fetch call logs from Supabase (to be implemented)
  const fetchCallLogs = async () => {
    try {
      // This will be implemented later to fetch from Supabase
      // const { data, error } = await supabase
      //   .from('call_logs')
      //   .select('*')
      //   .order('call_datetime', { ascending: false });
      
      // if (error) throw error;
      // setCallLogs(data);
    } catch (error) {
      console.error("Error fetching call logs:", error);
      toast.error("Failed to load call history");
    }
  };

  // Sort the call logs (in a real application, this would be done at DB level)
  const sortedCallLogs = [...callLogs].sort((a, b) => {
    if (!sortField) return 0;
    
    let comparison = 0;
    
    switch (sortField) {
      case "datetime":
        comparison = new Date(a.call_datetime).getTime() - new Date(b.call_datetime).getTime();
        break;
      case "duration":
        comparison = a.duration.localeCompare(b.duration);
        break;
      case "number":
        comparison = a.caller_number.localeCompare(b.caller_number);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        return 0;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
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

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg border shadow-md">
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4 flex items-center shadow-sm">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Calls</div>
                  <div className="text-xl font-bold">0</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 flex items-center shadow-sm">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg. Duration</div>
                  <div className="text-xl font-bold">0:00</div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 flex items-center shadow-sm">
                <div className="bg-purple-100 rounded-full p-2 mr-3">
                  <BarChart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Resolution Rate</div>
                  <div className="text-xl font-bold">0%</div>
                </div>
              </div>
            </div>
            
            {/* Search and filter */}
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
                      View: All
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem>All Calls</DropdownMenuItem>
                    <DropdownMenuItem>Resolved</DropdownMenuItem>
                    <DropdownMenuItem>Unresolved</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("number")}>
                      Caller Number
                      {sortField === "number" && (
                        <span className="ml-1 inline-block">
                          {sortDirection === "asc" ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                        </span>
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("datetime")}>
                      Date & Time
                      {sortField === "datetime" && (
                        <span className="ml-1 inline-block">
                          {sortDirection === "asc" ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                        </span>
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("duration")}>
                      Duration
                      {sortField === "duration" && (
                        <span className="ml-1 inline-block">
                          {sortDirection === "asc" ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                        </span>
                      )}
                    </TableHead>
                    <TableHead className="min-w-[200px]">Issue Summary</TableHead>
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
                  {sortedCallLogs.map((call) => (
                    <TableRow key={call.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          {call.caller_number}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(call.call_datetime)}</TableCell>
                      <TableCell>{call.duration}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {call.issue_summary || "No summary available"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            call.status === "Resolved" 
                              ? "bg-green-100 text-green-800 hover:bg-green-200" 
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }
                        >
                          {call.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openNotesDialog(call)}
                          >
                            <FileEdit className="h-4 w-4 mr-1" />
                            Notes
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">Status</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem onClick={() => updateCallStatus(call.id, "Resolved")}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Mark as Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateCallStatus(call.id, "Unresolved")}>
                                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                                Mark as Unresolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {callLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No call history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>

      {/* Notes Dialog */}
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
