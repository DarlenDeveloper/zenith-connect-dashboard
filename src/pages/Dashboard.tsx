import React, { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Clock4,
  Users,
  Smile,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ZenithLogo from "@/components/ZenithLogo";

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

  // Updated activity metrics for new styling
  const activityMetrics = [
    {
      label: "Customer Satisfaction",
      value: "0%",
      change: "+0%", // Indicate direction
      isPositive: true
    },
    {
      label: "Escalation Rate",
      value: "0%",
      change: "+0%", // Indicate direction
      isPositive: true // Assuming lower is better, might need logic flip
    }
  ];

  // Updated call data for chart styling
  const callData = [
    { day: "Feb 14", value: 0 },
    { day: "Feb 15", value: 0 },
    { day: "Feb 16", value: 0 },
    { day: "Feb 17", value: 0 },
    { day: "Feb 18", value: 0 },
    { day: "Feb 19", value: 0 },
    { day: "Feb 20", value: 0 },
  ];

  // Update stats card icons with black-bean colors
  const statsCards = [
    {
      icon: <Phone className="h-6 w-6 text-black-bean-600" />, // Green icon
      value: "0",
      label: "Total AI Calls",
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-black-bean-600" />, // Green icon
      value: "0",
      label: "Customer Interactions",
    },
    {
      icon: <Clock4 className="h-6 w-6 text-black-bean-600" />, // Green icon
      value: "0",
      label: "Average Call Duration",
    },
    {
      icon: <CircleDot className="h-6 w-6 text-black-bean-600" />, // Green icon
      value: "0",
      label: "Call Resolution Rate",
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
 

  return (
    <DashboardLayout>
      <div className="w-full h-full p-0 m-0">
        <div className="mb-4 lg:mb-4 px-4 lg:px-4 pt-4 lg:pt-4">
          <h1 className="text-2xl font-semibold text-gray-900">Hello, {user?.name || 'User'}!</h1>
          <p className="text-sm text-gray-600">Welcome back, here's your dashboard overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-4 mb-4 lg:mb-4">
          {statsCards.map((stat, index) => (
            <Card 
              key={index} 
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-5 lg:p-6">
                <div className="flex justify-between items-start mb-3 lg:mb-4">
                  <div className="p-2 bg-black-bean-100 rounded-md">
                     {stat.icon} 
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-4 mb-4 lg:mb-4"> 
          <div className="lg:col-span-1 space-y-6"> 
            {activityMetrics.map((metric, index) => (
              <Card 
                key={index} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-5 lg:p-6">
                  <h3 className="text-base font-medium text-gray-600 mb-3">{metric.label}</h3> 
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{metric.value}</span> 
                    <span className={`text-sm font-medium ${
                      metric.isPositive ? 'text-black-bean-700' : 'text-red-600' 
                    }`}>
                      {metric.change} 
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5 lg:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium text-gray-700">AI Call Activity</h3> 
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
                      cursor={{ fill: 'rgba(235, 254, 238, 0.5)' }} /* Lighter green hover */
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
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-4 pb-4 lg:pb-4">
          <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5 lg:p-6">
              <h3 className="text-base font-medium text-gray-700 mb-4">Recent customer interactions</h3>
              <div className="space-y-4">
                {recentEmails.map((email, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 bg-white">
                        <ZenithLogo className="h-6 w-auto text-black-bean-700" />
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{email.name}</p>
                        <p className="text-xs text-gray-500">{email.subject}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{email.time}</span>
                  </div>
                ))}
                {recentEmails.length === 0 && (
                   <p className="text-sm text-gray-500 text-center py-4">No recent interactions found.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5 lg:p-6">
              <h3 className="text-base font-medium text-gray-700 mb-3">Setup Status</h3>
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                   <p className="text-sm text-gray-600">Update Profile</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                   <p className="text-sm text-gray-600">Make a Payment</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">Receive Customer Care Phone Number</p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
