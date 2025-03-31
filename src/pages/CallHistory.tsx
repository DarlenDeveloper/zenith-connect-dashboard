
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PhoneCall, Calendar, Clock, User, BarChart, Phone } from "lucide-react";

const CallHistory = () => {
  // Sample data for demonstration
  const callHistory = [
    { id: 1, customer: "John Smith", date: "2023-07-24", time: "10:30 AM", duration: "4:32", result: "Resolved", type: "Inbound" },
    { id: 2, customer: "Sarah Johnson", date: "2023-07-23", time: "2:15 PM", duration: "8:47", result: "Escalated", type: "Outbound" },
    { id: 3, customer: "Michael Brown", date: "2023-07-22", time: "11:05 AM", duration: "3:18", result: "Resolved", type: "Inbound" },
    { id: 4, customer: "Emily Davis", date: "2023-07-21", time: "9:45 AM", duration: "6:22", result: "Callback", type: "Outbound" },
    { id: 5, customer: "David Wilson", date: "2023-07-20", time: "4:30 PM", duration: "5:12", result: "Resolved", type: "Inbound" },
  ];

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
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4 flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Calls</div>
                  <div className="text-xl font-bold">248</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg. Duration</div>
                  <div className="text-xl font-bold">5:24</div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 flex items-center">
                <div className="bg-purple-100 rounded-full p-2 mr-3">
                  <BarChart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Resolution Rate</div>
                  <div className="text-xl font-bold">87%</div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Result</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {callHistory.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{call.customer}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          call.type === "Inbound" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {call.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          call.result === "Resolved" ? "bg-green-100 text-green-800" : 
                          call.result === "Escalated" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {call.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="ghost" size="sm">Replay</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default CallHistory;
