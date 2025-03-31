
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Search, ChevronRight, Edit, Trash2, Copy } from "lucide-react";

const Scripts = () => {
  // Sample data for demonstration
  const scriptCategories = [
    { id: 1, name: "Customer Service", count: 12 },
    { id: 2, name: "Sales", count: 8 },
    { id: 3, name: "Technical Support", count: 10 },
    { id: 4, name: "Payment Processing", count: 5 },
    { id: 5, name: "Account Management", count: 7 },
  ];

  const scripts = [
    { 
      id: 1, 
      name: "Customer Welcome Script", 
      category: "Customer Service", 
      lastUpdated: "2023-07-15", 
      status: "Active",
      stats: { uses: 324, successRate: 94, avgDuration: "2:45" }
    },
    { 
      id: 2, 
      name: "Technical Issue Resolution", 
      category: "Technical Support", 
      lastUpdated: "2023-07-10", 
      status: "Active",
      stats: { uses: 189, successRate: 87, avgDuration: "6:18" }
    },
    { 
      id: 3, 
      name: "Subscription Upsell", 
      category: "Sales", 
      lastUpdated: "2023-07-05", 
      status: "Draft",
      stats: { uses: 0, successRate: 0, avgDuration: "0:00" }
    },
    { 
      id: 4, 
      name: "Payment Processing", 
      category: "Payment Processing", 
      lastUpdated: "2023-06-28", 
      status: "Active",
      stats: { uses: 156, successRate: 82, avgDuration: "4:32" }
    },
    { 
      id: 5, 
      name: "Account Setup Guide", 
      category: "Account Management", 
      lastUpdated: "2023-06-22", 
      status: "Active",
      stats: { uses: 142, successRate: 91, avgDuration: "3:54" }
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-gray-500" />
            <h1 className="text-xl font-medium">AI Call Scripts</h1>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Script
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Categories sidebar */}
            <div className="w-full md:w-64 bg-white rounded-lg border border-gray-200 shadow-sm h-fit">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search scripts..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="p-2">
                <div className="py-2 px-3 text-sm font-medium text-gray-500">CATEGORIES</div>
                <button className="w-full flex items-center justify-between py-2 px-3 rounded-md text-sm text-left font-medium bg-gray-100 text-black">
                  <span>All Scripts</span>
                  <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs">{scripts.length}</span>
                </button>
                
                {scriptCategories.map((category) => (
                  <button 
                    key={category.id}
                    className="w-full flex items-center justify-between py-2 px-3 rounded-md text-sm text-left font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span>{category.name}</span>
                    <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs">{category.count}</span>
                  </button>
                ))}
                
                <div className="mt-2 py-2 px-3 text-sm font-medium text-gray-500">STATUS</div>
                <button className="w-full flex items-center justify-between py-2 px-3 rounded-md text-sm text-left font-medium text-gray-700 hover:bg-gray-50">
                  <span>Active</span>
                  <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs">4</span>
                </button>
                <button className="w-full flex items-center justify-between py-2 px-3 rounded-md text-sm text-left font-medium text-gray-700 hover:bg-gray-50">
                  <span>Draft</span>
                  <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs">1</span>
                </button>
              </div>
            </div>
            
            {/* Scripts list */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="font-medium">All Scripts</h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                  <select className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-sm">
                    <option>Last Updated</option>
                    <option>Name (A-Z)</option>
                    <option>Most Used</option>
                    <option>Success Rate</option>
                  </select>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {scripts.map((script) => (
                  <div key={script.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium flex items-center">
                          {script.name}
                          {script.status === "Draft" && (
                            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Draft</span>
                          )}
                        </h3>
                        <div className="text-sm text-gray-500 mt-1">
                          Category: {script.category} • Last Updated: {script.lastUpdated}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-1">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-1">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-1 text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {script.status === "Active" && (
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-md p-2 text-center">
                          <div className="text-xs text-gray-500">Uses</div>
                          <div className="font-medium">{script.stats.uses}</div>
                        </div>
                        <div className="bg-gray-50 rounded-md p-2 text-center">
                          <div className="text-xs text-gray-500">Success Rate</div>
                          <div className="font-medium">{script.stats.successRate}%</div>
                        </div>
                        <div className="bg-gray-50 rounded-md p-2 text-center">
                          <div className="text-xs text-gray-500">Avg. Duration</div>
                          <div className="font-medium">{script.stats.avgDuration}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Scripts;
