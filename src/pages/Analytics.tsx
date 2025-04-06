import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BarChart2, Calendar, ArrowUpRight, ArrowDownRight, Clock, Users, Phone, MessageSquare } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card } from "@/components/ui/card";

const Analytics = () => {
  // Sample data for charts - all zeros
  const callData = [
    { name: "Jan", inbound: 0, outbound: 0 },
    { name: "Feb", inbound: 0, outbound: 0 },
    { name: "Mar", inbound: 0, outbound: 0 },
    { name: "Apr", inbound: 0, outbound: 0 },
    { name: "May", inbound: 0, outbound: 0 },
    { name: "Jun", inbound: 0, outbound: 0 },
  ];

  const timeData = [
    { name: "Mon", time: 0 },
    { name: "Tue", time: 0 },
    { name: "Wed", time: 0 },
    { name: "Thu", time: 0 },
    { name: "Fri", time: 0 },
    { name: "Sat", time: 0 },
    { name: "Sun", time: 0 },
  ];

  const satisfactionData = [
    { name: "Very Satisfied", value: 0 },
    { name: "Satisfied", value: 0 },
    { name: "Neutral", value: 0 },
    { name: "Dissatisfied", value: 0 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
                  <h3 className="text-2xl font-bold mt-1">0</h3>
                </div>
                <div className="bg-blue-100 rounded-full p-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
                <span className="text-green-500 font-medium">0%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </Card>
            
            <Card className="p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Resolution Rate</p>
                  <h3 className="text-2xl font-bold mt-1">0%</h3>
                </div>
                <div className="bg-green-100 rounded-full p-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
                <span className="text-green-500 font-medium">0%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </Card>
            
            <Card className="p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Avg. Call Time</p>
                  <h3 className="text-2xl font-bold mt-1">0:00</h3>
                </div>
                <div className="bg-yellow-100 rounded-full p-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowDownRight className="text-green-500 mr-1 h-4 w-4" />
                <span className="text-green-500 font-medium">0%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </Card>
            
            <Card className="p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">New Customers</p>
                  <h3 className="text-2xl font-bold mt-1">0</h3>
                </div>
                <div className="bg-purple-100 rounded-full p-2">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
                <span className="text-green-500 font-medium">0%</span>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={callData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inbound" fill="#4f46e5" name="Inbound" />
                  <Bar dataKey="outbound" fill="#10b981" name="Outbound" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Call Duration</h3>
                <Button variant="outline" size="sm">Weekly</Button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="time" stroke="#3b82f6" name="Minutes" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Customer Satisfaction</h3>
                <Button variant="outline" size="sm">All Time</Button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
                          <span className="font-medium mr-2">0%</span>
                          <div className="bg-gray-200 h-1.5 w-24 rounded-full">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">0:00</td>
                      <td className="py-3 px-4">0</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">Technical Support</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">0%</span>
                          <div className="bg-gray-200 h-1.5 w-24 rounded-full">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">0:00</td>
                      <td className="py-3 px-4">0</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">Payment Issues</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">0%</span>
                          <div className="bg-gray-200 h-1.5 w-24 rounded-full">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">0:00</td>
                      <td className="py-3 px-4">0</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Account Setup</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">0%</span>
                          <div className="bg-gray-200 h-1.5 w-24 rounded-full">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">0:00</td>
                      <td className="py-3 px-4">0</td>
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
