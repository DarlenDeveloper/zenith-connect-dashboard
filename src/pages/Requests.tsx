
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Search, Filter, Clock, User, 
  ChevronRight, AlertCircle, CheckCircle, 
  XCircle, PlusCircle, Download
} from "lucide-react";

// Request type
interface Request {
  id: string;
  customerName: string;
  email: string;
  topic: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

// Sample requests data
const sampleRequests: Request[] = [
  { 
    id: "req-1", 
    customerName: "Alice Johnson", 
    email: "alice.johnson@example.com",
    topic: "Account Access",
    message: "I'm unable to login to my account. Can you please help me reset my password?",
    status: "pending", 
    priority: "high",
    createdAt: "2023-07-15T10:30:00Z"
  },
  { 
    id: "req-2", 
    customerName: "Robert Smith", 
    email: "robert.smith@example.com",
    topic: "Billing Issue",
    message: "I was charged twice for my last subscription payment. Can you check and refund the extra charge?",
    status: "approved", 
    priority: "medium",
    createdAt: "2023-07-14T15:45:00Z"
  },
  { 
    id: "req-3", 
    customerName: "Emily Davis", 
    email: "emily.davis@example.com",
    topic: "Feature Request",
    message: "Would it be possible to add a dark mode to the application? It would help reduce eye strain when using it at night.",
    status: "rejected", 
    priority: "low",
    createdAt: "2023-07-13T09:15:00Z"
  },
  { 
    id: "req-4", 
    customerName: "Michael Brown", 
    email: "michael.brown@example.com",
    topic: "Technical Support",
    message: "The export function is not working correctly. When I try to export my data, I get an error message.",
    status: "pending", 
    priority: "high",
    createdAt: "2023-07-15T08:20:00Z"
  },
  { 
    id: "req-5", 
    customerName: "Sarah Wilson", 
    email: "sarah.wilson@example.com",
    topic: "Subscription Change",
    message: "I would like to upgrade from the Basic plan to the Pro plan. What do I need to do?",
    status: "approved", 
    priority: "medium",
    createdAt: "2023-07-12T14:10:00Z"
  },
  { 
    id: "req-6", 
    customerName: "James Taylor", 
    email: "james.taylor@example.com",
    topic: "Data Recovery",
    message: "I accidentally deleted some important information. Is there any way to recover it?",
    status: "pending", 
    priority: "high",
    createdAt: "2023-07-15T11:05:00Z"
  },
];

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-blue-100 text-blue-800";
    case "low":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Requests = () => {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [filter, setFilter] = useState("all");

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <h1 className="text-xl font-medium">Requests</h1>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-black text-white hover:bg-gray-800">
              <PlusCircle size={16} className="mr-2" />
              New request
            </Button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden bg-[#f9f9f9]">
          {/* Requests list */}
          <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
            {/* Search and filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2"
                  placeholder="Search requests"
                />
              </div>
              
              {/* Filters */}
              <div className="flex mt-3 space-x-2">
                <Button 
                  variant={filter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "bg-black text-white" : ""}
                >
                  All
                </Button>
                <Button 
                  variant={filter === "pending" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("pending")}
                  className={filter === "pending" ? "bg-black text-white" : ""}
                >
                  Pending
                </Button>
                <Button 
                  variant={filter === "approved" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("approved")}
                  className={filter === "approved" ? "bg-black text-white" : ""}
                >
                  Approved
                </Button>
                <Button 
                  variant={filter === "rejected" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("rejected")}
                  className={filter === "rejected" ? "bg-black text-white" : ""}
                >
                  Rejected
                </Button>
              </div>
            </div>
            
            {/* Requests list */}
            <div className="flex-1 overflow-y-auto">
              {sampleRequests
                .filter(req => filter === "all" || req.status === filter)
                .map((request) => (
                <div 
                  key={request.id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${selectedRequest?.id === request.id ? 'bg-gray-50' : ''}`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{request.customerName}</h3>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">{request.topic}</p>
                  <div className="flex mt-2 gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Request details */}
          <div className="flex-1 bg-white flex flex-col">
            {selectedRequest ? (
              <>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                        <User size={20} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">{selectedRequest.customerName}</h2>
                        <div className="flex items-center text-sm text-gray-500">
                          {selectedRequest.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </span>
                      <Button variant="outline" size="sm">View profile</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Request Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Topic</p>
                            <p className="font-medium">{selectedRequest.topic}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Priority</p>
                            <p className="font-medium capitalize">{selectedRequest.priority}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Submitted</p>
                            <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium capitalize">{selectedRequest.status}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Message</p>
                          <p className="text-gray-700">{selectedRequest.message}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Response</h3>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {selectedRequest.status === "pending" ? (
                          <div className="text-center py-4">
                            <AlertCircle size={24} className="mx-auto mb-2 text-yellow-500" />
                            <p className="text-gray-700">This request is still pending review.</p>
                          </div>
                        ) : selectedRequest.status === "approved" ? (
                          <div>
                            <div className="flex items-center mb-3">
                              <CheckCircle size={16} className="text-green-500 mr-2" />
                              <p className="text-green-700 font-medium">Request approved</p>
                            </div>
                            <p className="text-gray-700">
                              Thank you for your request. We have reviewed and approved it. Our team will process it shortly.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center mb-3">
                              <XCircle size={16} className="text-red-500 mr-2" />
                              <p className="text-red-700 font-medium">Request rejected</p>
                            </div>
                            <p className="text-gray-700">
                              We've reviewed your request but unfortunately, we are unable to approve it at this time. Please contact our support team for more information.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedRequest.status === "pending" && (
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-black text-white hover:bg-gray-800">
                          <CheckCircle size={16} className="mr-2" />
                          Approve Request
                        </Button>
                        <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                          <XCircle size={16} className="mr-2" />
                          Reject Request
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={24} className="text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No request selected</h2>
                <p className="text-gray-500 max-w-md">
                  Select a request from the list to view its details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Requests;
