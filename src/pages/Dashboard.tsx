
import React, { useEffect } from "react";
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
  Info,
  Phone,
  MessageCircle,
  Clock4
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

  // Mock data - all zeroed out as placeholders
  const callData = [
    { day: "Feb 14", value: 0 },
    { day: "Feb 15", value: 0 },
    { day: "Feb 16", value: 0 },
    { day: "Feb 17", value: 0 },
    { day: "Feb 18", value: 0 },
    { day: "Feb 19", value: 0 },
    { day: "Feb 20", value: 0 },
  ];

  // Stats cards data
  const statsCards = [
    {
      icon: <div className="bg-indigo-900 p-2 rounded-md text-indigo-300"><Phone className="h-5 w-5" /></div>,
      value: "0",
      label: "Total AI Calls",
      color: "text-indigo-300"
    },
    {
      icon: <div className="bg-purple-900 p-2 rounded-md text-purple-300"><MessageCircle className="h-5 w-5" /></div>,
      value: "0",
      label: "Customer Interactions",
      color: "text-purple-300"
    },
    {
      icon: <div className="bg-green-900 p-2 rounded-md text-green-300"><Clock4 className="h-5 w-5" /></div>,
      value: "0",
      label: "Average Call Duration",
      color: "text-green-300"
    },
    {
      icon: <div className="bg-blue-900 p-2 rounded-md text-blue-300"><CircleDot className="h-5 w-5" /></div>,
      value: "0",
      label: "Call Resolution Rate",
      color: "text-blue-300"
    }
  ];

  // Activity metrics
  const activityMetrics = [
    {
      label: "Customer Satisfaction",
      value: "0%",
      change: "0%",
      isPositive: true
    },
    {
      label: "Escalation Rate",
      value: "0%",
      change: "0%",
      isPositive: true
    }
  ];

  // Recent emails
  const recentEmails = [
    {
      avatar: "/lovable-uploads/87a6871f-932d-4e71-b214-5e06fd2d0882.png",
      name: "Prospective Customer",
      subject: "AI Customer Care Demo Request",
      time: "No messages yet"
    },
    {
      avatar: "/lovable-uploads/87a6871f-932d-4e71-b214-5e06fd2d0882.png",
      name: "Tech Support",
      subject: "AI Voice Configuration",
      time: "No messages yet"
    }
  ];

  // Todo items
  const todoItems = [
    {
      task: "Configure AI Voice",
      time: "Not started"
    },
    {
      task: "Setup Script Templates",
      time: "Not started"
    },
    {
      task: "Train AI Model",
      time: "Not started"
    },
    {
      task: "Test Customer Interactions",
      time: "Not started"
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Greeting header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Hello, {user?.name || 'User'}!</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="bg-gray-900 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  {stat.icon}
                  <MoreHorizontal className="h-5 w-5 text-gray-400" />
                </div>
                <div className="mt-2">
                  <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Metrics & Call Data Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Activity Metrics */}
          <div className="space-y-4">
            {activityMetrics.map((metric, index) => (
              <Card key={index} className="bg-gray-900 border-0 shadow-lg">
                <CardContent className="p-4">
                  <h3 className="text-sm text-gray-400 mb-2">{metric.label}</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{metric.value}</span>
                    <span className={`text-xs font-medium rounded-md px-2 py-1 ${
                      metric.isPositive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Call Data Chart */}
          <Card className="col-span-2 bg-gray-900 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm text-gray-300">AI Call Activity</h3>
                <p className="text-xs text-gray-400">Last 7 days</p>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={callData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#666" />
                    <YAxis axisLine={false} tickLine={false} stroke="#666" />
                    <Tooltip 
                      contentStyle={{ background: '#333', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', color: 'white', border: '1px solid #444' }}
                      formatter={(value) => [`${value}`, 'Calls']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                      activeDot={{ stroke: '#8884d8', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recent messages */}
          <Card className="col-span-2 bg-gray-900 border-0 shadow-lg">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-4 text-gray-300">Recent customer interactions</h3>
              <div className="space-y-4">
                {recentEmails.map((email, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={email.avatar} alt={email.name} />
                        <AvatarFallback className="bg-indigo-900 text-indigo-300">{email.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{email.name}</p>
                        <p className="text-xs text-gray-400">{email.subject}</p>
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
            {/* Setup status */}
            <Card className="bg-black text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-medium mb-1 text-gray-200">Setup status</h3>
                <p className="text-xs text-gray-400 mb-2">Getting started</p>
                <Progress value={0} className="h-1.5 mb-1 bg-gray-800" />
                <p className="text-xs text-gray-400 mb-2">Estimated completion</p>
                <p className="text-sm">Not started</p>
                <Button variant="outline" className="w-full mt-4 text-white border-gray-600 hover:bg-gray-800">
                  View guide
                </Button>
              </CardContent>
            </Card>

            {/* To-do list */}
            <Card className="bg-gray-900 border-0 shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-medium mb-4 text-gray-300">Your to-do list</h3>
                <div className="space-y-3">
                  {todoItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-gray-800 p-1.5 rounded-md mt-0.5">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{item.task}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Board meeting */}
            <Card className="bg-gray-900 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-500 rounded-full h-2 w-2"></div>
                  <h3 className="font-medium text-gray-200">AI Training</h3>
                </div>
                <p className="text-sm mb-2 text-gray-300">Not scheduled</p>
                <p className="text-xs text-gray-400">Schedule AI training sessions to improve customer interactions.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
