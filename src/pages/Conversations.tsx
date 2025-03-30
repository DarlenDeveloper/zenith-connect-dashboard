
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Search, Filter, Plus, MessageSquare, 
  Clock, User, ArrowRight 
} from "lucide-react";

// Conversation type
interface Conversation {
  id: string;
  customerName: string;
  lastMessage: string;
  timestamp: string;
  status: "active" | "completed" | "pending";
  summary?: string;
}

// Sample conversations data
const sampleConversations: Conversation[] = [
  { 
    id: "conv-1", 
    customerName: "Alice Johnson", 
    lastMessage: "I need help with my subscription renewal.",
    timestamp: "10 min ago", 
    status: "active",
    summary: "Customer was having trouble renewing their subscription. Helped them update payment method and complete the renewal process." 
  },
  { 
    id: "conv-2", 
    customerName: "Robert Smith", 
    lastMessage: "How do I change my account settings?",
    timestamp: "35 min ago", 
    status: "completed",
    summary: "Guided customer through account settings page. They successfully updated their notification preferences and email address."
  },
  { 
    id: "conv-3", 
    customerName: "Emily Davis", 
    lastMessage: "My payment isn't going through.",
    timestamp: "1 hour ago", 
    status: "active" 
  },
  { 
    id: "conv-4", 
    customerName: "Michael Brown", 
    lastMessage: "Can I get a refund for my last order?",
    timestamp: "3 hours ago", 
    status: "pending",
    summary: "Customer requested refund for order #12345. Checking eligibility per return policy. Need to follow up with more information."
  },
  { 
    id: "conv-5", 
    customerName: "Sarah Wilson", 
    lastMessage: "I'm getting an error when trying to login.",
    timestamp: "5 hours ago", 
    status: "completed",
    summary: "Customer was experiencing login issues. Guided them through password reset process and they were able to successfully access their account."
  },
  { 
    id: "conv-6", 
    customerName: "James Taylor", 
    lastMessage: "How do I download my invoice?",
    timestamp: "Yesterday", 
    status: "completed" 
  },
  { 
    id: "conv-7", 
    customerName: "Jennifer Martinez", 
    lastMessage: "I need to update my shipping address.",
    timestamp: "Yesterday", 
    status: "completed" 
  },
];

const Conversations = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState("all");

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <h1 className="text-xl font-medium">Conversations</h1>
          
          <Button size="sm" className="bg-black text-white hover:bg-gray-800">
            <Plus size={16} className="mr-2" />
            New conversation
          </Button>
        </header>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden bg-[#f9f9f9]">
          {/* Conversations list */}
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
                  placeholder="Search conversations"
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
                  variant={filter === "active" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("active")}
                  className={filter === "active" ? "bg-black text-white" : ""}
                >
                  Active
                </Button>
                <Button 
                  variant={filter === "completed" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("completed")}
                  className={filter === "completed" ? "bg-black text-white" : ""}
                >
                  Completed
                </Button>
              </div>
            </div>
            
            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {sampleConversations
                .filter(conv => filter === "all" || conv.status === filter)
                .map((conversation) => (
                <div 
                  key={conversation.id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{conversation.customerName}</h3>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">{conversation.lastMessage}</p>
                  <div className="flex mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      conversation.status === 'active' ? 'bg-green-100 text-green-800' : 
                      conversation.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Conversation details */}
          <div className="flex-1 bg-white flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                        <User size={20} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">{selectedConversation.customerName}</h2>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            selectedConversation.status === 'active' ? 'bg-green-500' : 
                            selectedConversation.status === 'completed' ? 'bg-gray-500' : 
                            'bg-yellow-500'
                          }`}></span>
                          {selectedConversation.status.charAt(0).toUpperCase() + selectedConversation.status.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">View profile</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Conversation Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700">
                          {selectedConversation.summary || "No summary available for this conversation yet."}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{selectedConversation.customerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{selectedConversation.customerName.toLowerCase().replace(' ', '.')}@example.com</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Conversation Started</p>
                            <p className="font-medium">{selectedConversation.timestamp}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium capitalize">{selectedConversation.status}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Recent Messages</h3>
                      <div className="space-y-3">
                        <div className="flex">
                          <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <User size={16} />
                          </div>
                          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                            <p className="text-sm">{selectedConversation.lastMessage}</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedConversation.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-black p-3 rounded-lg max-w-[80%] text-white">
                            <p className="text-sm">Thanks for reaching out. I'd be happy to help you with that. Can you provide more details?</p>
                            <p className="text-xs text-gray-300 mt-1">{selectedConversation.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 mr-2"
                      placeholder="Type your message..."
                    />
                    <Button className="bg-black text-white hover:bg-gray-800">
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={24} className="text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No conversation selected</h2>
                <p className="text-gray-500 max-w-md">
                  Select a conversation from the list or start a new one to begin chatting.
                </p>
                <Button className="mt-4 bg-black text-white hover:bg-gray-800">
                  <Plus size={16} className="mr-2" />
                  New conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Conversations;
