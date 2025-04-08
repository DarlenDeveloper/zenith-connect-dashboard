import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BarChart2, Calendar, ArrowUpRight, ArrowDownRight, Clock, Users, Phone, MessageSquare } from "lucide-react";
import {
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
  // Sample data for charts - matching dashboard style
  const callData = [
    { day: "Feb 14", value: 0 },
    { day: "Feb 15", value: 0 },
    { day: "Feb 16", value: 0 },
    { day: "Feb 17", value: 0 },
    { day: "Feb 18", value: 0 },
    { day: "Feb 19", value: 0 },
    { day: "Feb 20", value: 0 },
  ];

  const timeData = [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ];

  const satisfactionData = [
    { name: "Very Satisfied", value: 0 },
    { name: "Satisfied", value: 0 },
    { name: "Neutral", value: 0 },
    { name: "Dissatisfied", value: 0 },
  ];
  
  const COLORS = ['#009d33', '#00C49F', '#FFBB28', '#FF8042'];

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
        <main className="flex-1 overflow-auto bg-gray-100 p-6">
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 lg:p-6">
                <div className="flex justify-between items-start mb-3 lg:mb-4">
                  <div className="p-2 bg-black-bean-100 rounded-md">
                    <Phone className="h-6 w-6 text-black-bean-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">0</h3>
                  <p className="text-sm text-gray-500">Total Calls</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 lg:p-6">
                <div className="flex justify-between items-start mb-3 lg:mb-4">
                  <div className="p-2 bg-black-bean-100 rounded-md">
                    <MessageSquare className="h-6 w-6 text-black-bean-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">0%</h3>
                  <p className="text-sm text-gray-500">Resolution Rate</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 lg:p-6">
                <div className="flex justify-between items-start mb-3 lg:mb-4">
                  <div className="p-2 bg-black-bean-100 rounded-md">
                    <Clock className="h-6 w-6 text-black-bean-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">0:00</h3>
                  <p className="text-sm text-gray-500">Average Call Time</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 lg:p-6">
                <div className="flex justify-between items-start mb-3 lg:mb-4">
                  <div className="p-2 bg-black-bean-100 rounded-md">
                    <Users className="h-6 w-6 text-black-bean-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">0</h3>
                  <p className="text-sm text-gray-500">New Customers</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 lg:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium text-gray-700">Call Activity</h3>
                  <p className="text-sm text-gray-500">Last 7 days</p>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={callData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        stroke="#6b7280"
                        fontSize={12} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        stroke="#6b7280"
                        fontSize={12}
                        dx={-10}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(235, 254, 238, 0.5)' }}
                        contentStyle={{ 
                          background: 'white', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
                          color: '#1f2937', 
                          border: '1px solid #e5e7eb' 
                        }}
                        formatter={(value: number) => [`${value}`, 'Calls']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#009d33"
                        strokeWidth={2.5}
                        dot={{ stroke: '#009d33', strokeWidth: 2, r: 4, fill: 'white' }}
                        activeDot={{ stroke: '#009d33', strokeWidth: 2, r: 6, fill: '#009d33' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 lg:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium text-gray-700">Customer Satisfaction</h3>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={satisfactionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#009d33"
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {satisfactionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
                          color: '#1f2937', 
                          border: '1px solid #e5e7eb' 
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 lg:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium text-gray-700">Call Duration Trends</h3>
                  <p className="text-sm text-gray-500">This Week</p>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        stroke="#6b7280"
                        fontSize={12} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        stroke="#6b7280"
                        fontSize={12}
                        dx={-10}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(235, 254, 238, 0.5)' }}
                        contentStyle={{ 
                          background: 'white', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
                          color: '#1f2937', 
                          border: '1px solid #e5e7eb' 
                        }}
                        formatter={(value: number) => [`${value}`, 'Minutes']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#009d33"
                        strokeWidth={2.5}
                        dot={{ stroke: '#009d33', strokeWidth: 2, r: 4, fill: 'white' }}
                        activeDot={{ stroke: '#009d33', strokeWidth: 2, r: 6, fill: '#009d33' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 lg:p-6">
                <h3 className="text-base font-medium text-gray-700 mb-4">Top Scripts</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Customer Welcome</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-black-bean-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Technical Support</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-black-bean-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Payment Issues</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-black-bean-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
