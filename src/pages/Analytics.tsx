
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BarChart2, Calendar, ArrowUpRight, ArrowDownRight, Clock, Users, Phone, MessageSquare } from "lucide-react";
import { BarChart, LineChart, PieChart, AreaChart } from "recharts";
import { Card } from "@/components/ui/card";

const Analytics = () => {
  // Sample data for charts
  const callData = [
    { name: "Jan", inbound: 65, outbound: 45 },
    { name: "Feb", inbound: 78, outbound: 52 },
    { name: "Mar", inbound: 82, outbound: 70 },
    { name: "Apr", inbound: 70, outbound: 55 },
    { name: "May", inbound: 85, outbound: 65 },
    { name: "Jun", inbound: 90, outbound: 72 },
  ];

  const timeData = [
    { name: "Mon", time: 240 },
    { name: "Tue", time: 312 },
    { name: "Wed", time: 285 },
    { name: "Thu", time: 350 },
    { name: "Fri", time: 270 },
    { name: "Sat", time: 180 },
    { name: "Sun", time: 120 },
  ];

  const satisfactionData = [
    { name: "Very Satisfied", value: 65 },
    { name: "Satisfied", value: 25 },
    { name: "Neutral", value: 7 },
    { name: "Dissatisfied", value: 3 },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <div className="flex items-center">
            <BarChart2 className="mr-2 h-5 w-5 text-gray-500" />
            <h1 className="text-xl font-medium">Analytics</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Calls</p>
                  <h3 className="text-2xl font-bold mt-1">1,248</h3>
                </div>
                <div className="bg-blue-100 rounded-full p-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
                <span className="text-green-500 font-medium">12%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </Card>
            
            <Card className="p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Resolution Rate</p>
                  <h3 className="text-2xl font-bold mt-1">87%</h3>
                </div>
                <div className="bg-green-100 rounded-full p-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
                <span className="text-green-500 font-medium">5%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </Card>
            
            <Card className="p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Avg. Call Time</p>
                  <h3 className="text-2xl font-bold mt-1">5:24</h3>
                </div>
                <div className="bg-yellow-100 rounded-full p-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowDownRight className="text-green-500 mr-1 h-4 w-4" />
                <span className="text-green-500 font-medium">8%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </Card>
            
            <Card className="p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">New Customers</p>
                  <h3 className="text-2xl font-bold mt-1">342</h3>
                </div>
                <div className="bg-purple-100 rounded-full p-2">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
                <span className="text-green-500 font-medium">18%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Call Volume</h3>
                <Button variant="outline" size="sm">Monthly</Button>
              </div>
              <BarChart width={500} height={300} data={callData}>
                {/* Chart configuration would go here */}
              </BarChart>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Call Duration</h3>
                <Button variant="outline" size="sm">Weekly</Button>
              </div>
              <LineChart width={500} height={300} data={timeData}>
                {/* Chart configuration would go here */}
              </LineChart>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Customer Satisfaction</h3>
                <Button variant="outline" size="sm">All Time</Button>
              </div>
              <PieChart width={300} height={300}>
                {/* Chart configuration would go here */}
              </PieChart>
            </div>
            
            <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Top Performing AI Scripts</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Script Name</th>
                      <th className="text-left py-3 px-4">Success Rate</th>
                      <th className="text-left py-3 px-4">Avg. Duration</th>
                      <th className="text-left py-3 px-4">Uses</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">Customer Welcome</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">94%</span>
                          <div className="bg-gray-200 h-1.5 w-24 rounded-full">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">2:45</td>
                      <td className="py-3 px-4">324</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">Technical Support</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">87%</span>
                          <div className="bg-gray-200 h-1.5 w-24 rounded-full">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '87%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">6:18</td>
                      <td className="py-3 px-4">189</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">Payment Issues</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">82%</span>
                          <div className="bg-gray-200 h-1.5 w-24 rounded-full">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">4:32</td>
                      <td className="py-3 px-4">156</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Account Setup</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">91%</span>
                          <div className="bg-gray-200 h-1.5 w-24 rounded-full">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '91%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">3:54</td>
                      <td className="py-3 px-4">142</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
