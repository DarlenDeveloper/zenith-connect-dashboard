
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import {
  MoreHorizontal,
  Calendar,
  Clock,
  CircleDot,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const subscriptionStatus = searchParams.get('subscription');
  
  useEffect(() => {
    if (subscriptionStatus === 'success') {
      toast.success('Subscription activated successfully! Welcome to the premium plan.');
      
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.toString());
    }
  }, [subscriptionStatus]);

  // Mock data
  const revenueData = [
    { day: "Feb 14", value: 12000 },
    { day: "Feb 15", value: 14000 },
    { day: "Feb 16", value: 11000 },
    { day: "Feb 17", value: 16000 },
    { day: "Feb 18", value: 18000 },
    { day: "Feb 19", value: 16500 },
    { day: "Feb 20", value: 19000 },
  ];

  // Stats cards data
  const statsCards = [
    {
      icon: <div className="bg-blue-100 p-2 rounded-md text-blue-600"><CircleDot className="h-5 w-5" /></div>,
      value: "143,624",
      label: "Your bank balance",
      color: "text-blue-600"
    },
    {
      icon: <div className="bg-orange-100 p-2 rounded-md text-orange-600"><Info className="h-5 w-5" /></div>,
      value: "12",
      label: "Uncategorized transactions",
      color: "text-orange-600"
    },
    {
      icon: <div className="bg-green-100 p-2 rounded-md text-green-600"><CircleDot className="h-5 w-5" /></div>,
      value: "7",
      label: "Employees working today",
      color: "text-green-600"
    },
    {
      icon: <div className="bg-purple-100 p-2 rounded-md text-purple-600"><CircleDot className="h-5 w-5" /></div>,
      value: "$3,287.49",
      label: "This week's card spending",
      color: "text-purple-600"
    }
  ];

  // Activity metrics
  const activityMetrics = [
    {
      label: "New clients",
      value: "54",
      change: "+18.7%",
      isPositive: true
    },
    {
      label: "Invoices overdue",
      value: "6",
      change: "+2.7%",
      isPositive: false
    }
  ];

  // Recent emails
  const recentEmails = [
    {
      avatar: "/lovable-uploads/87a6871f-932d-4e71-b214-5e06fd2d0882.png", // Using uploaded image as placeholder
      name: "Hannah Morgan",
      subject: "Meeting scheduled",
      time: "1:24 PM"
    },
    {
      avatar: "/lovable-uploads/87a6871f-932d-4e71-b214-5e06fd2d0882.png",
      name: "Megan Clark",
      subject: "Update on marketing campaign",
      time: "12:32 PM"
    },
    {
      avatar: "/lovable-uploads/87a6871f-932d-4e71-b214-5e06fd2d0882.png",
      name: "Brandon Williams",
      subject: "Design 2.0 is about to launch",
      time: "Yesterday at 8:57 PM"
    },
    {
      avatar: "/lovable-uploads/87a6871f-932d-4e71-b214-5e06fd2d0882.png",
      name: "Reid Smith",
      subject: "My friend Julie loves Doppr!",
      time: "Yesterday at 8:49 PM"
    }
  ];

  // Todo items
  const todoItems = [
    {
      task: "Run payroll",
      time: "Mar 4 at 6:00 pm"
    },
    {
      task: "Review time off request",
      time: "Mar 3 at 6:00 pm"
    },
    {
      task: "Sign board resolution",
      time: "Mar 12 at 6:00 pm"
    },
    {
      task: "Finish onboarding Tony",
      time: "Jun 14 at 6:00 pm"
    }
  ];

  // Board meeting
  const boardMeeting = {
    date: "Feb 22 at 6:00 PM",
    description: "You have been invited to attend a meeting of the board directors."
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto w-full">
        {/* Greeting header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Good morning, {user?.name?.split(' ')[0] || 'User'}!</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  {stat.icon}
                  <MoreHorizontal className="h-5 w-5 text-gray-400" />
                </div>
                <div className="mt-2">
                  <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Metrics & Revenue Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Activity Metrics */}
          <div className="space-y-4">
            {activityMetrics.map((metric, index) => (
              <Card key={index} className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <h3 className="text-sm text-gray-500 mb-2">{metric.label}</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">{metric.value}</span>
                    <span className={`text-xs font-medium rounded-md px-2 py-1 ${
                      metric.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Chart */}
          <Card className="col-span-2 bg-gray-50 border-0">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm text-gray-500">Revenue</h3>
                <p className="text-xs text-gray-400">Last 7 days VS prior week</p>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4F46E5" 
                      strokeWidth={2}
                      dot={{ stroke: '#4F46E5', strokeWidth: 2, r: 4 }}
                      activeDot={{ stroke: '#4F46E5', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recent emails */}
          <Card className="col-span-2 bg-gray-50 border-0">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-4">Recent emails</h3>
              <div className="space-y-4">
                {recentEmails.map((email, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={email.avatar} alt={email.name} />
                        <AvatarFallback>{email.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{email.name}</p>
                        <p className="text-xs text-gray-500">{email.subject}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{email.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Formation status */}
            <Card className="bg-black text-white border-0">
              <CardContent className="p-4">
                <h3 className="font-medium mb-1">Formation status</h3>
                <p className="text-xs text-gray-300 mb-2">In progress</p>
                <Progress value={70} className="h-1.5 mb-1" />
                <p className="text-xs text-gray-300 mb-2">Estimated processing</p>
                <p className="text-sm">4-5 business days</p>
                <Button variant="outline" className="w-full mt-4 text-white border-gray-600 hover:bg-gray-800">
                  View status
                </Button>
              </CardContent>
            </Card>

            {/* To-do list */}
            <Card className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Your to-Do list</h3>
                <div className="space-y-3">
                  {todoItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-gray-200 p-1.5 rounded-md mt-0.5">
                        <Clock className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.task}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Board meeting */}
            <Card className="bg-gray-900 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-500 rounded-full h-2 w-2"></div>
                  <h3 className="font-medium">Board meeting</h3>
                </div>
                <p className="text-sm mb-2">{boardMeeting.date}</p>
                <p className="text-xs text-gray-300">{boardMeeting.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
