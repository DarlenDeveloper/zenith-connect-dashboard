
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  MessageSquare,
  Clock,
  Bot,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");

  // Mock data
  const conversationData = [
    { name: "Mon", value: 420 },
    { name: "Tue", value: 380 },
    { name: "Wed", value: 450 },
    { name: "Thu", value: 520 },
    { name: "Fri", value: 580 },
    { name: "Sat", value: 410 },
    { name: "Sun", value: 390 }
  ];
  
  const responseTimeData = [
    { name: "Mon", value: 30 },
    { name: "Tue", value: 28 },
    { name: "Wed", value: 32 },
    { name: "Thu", value: 25 },
    { name: "Fri", value: 22 },
    { name: "Sat", value: 20 },
    { name: "Sun", value: 19 }
  ];
  
  const satisfactionData = [
    { name: "Excellent", value: 58 },
    { name: "Good", value: 27 },
    { name: "Average", value: 10 },
    { name: "Poor", value: 5 }
  ];
  
  const SATISFACTION_COLORS = ['#4ade80', '#a3e635', '#facc15', '#f87171'];
  
  const resolutionData = [
    { name: "AI Resolved", value: 78 },
    { name: "Agent Assisted", value: 22 }
  ];
  
  const RESOLUTION_COLORS = ['#0ea5e9', '#6366f1'];

  // Stats cards data
  const statsData = [
    {
      title: "Total Conversations",
      value: "3,240",
      change: "+12.5%",
      increasing: true,
      icon: <MessageSquare className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Average Response Time",
      value: "25s",
      change: "-30%",
      increasing: false,
      icon: <Clock className="h-5 w-5 text-green-500" />
    },
    {
      title: "Active Users",
      value: "1,893",
      change: "+8.2%",
      increasing: true,
      icon: <Users className="h-5 w-5 text-purple-500" />
    },
    {
      title: "AI Resolution Rate",
      value: "78%",
      change: "+5.3%",
      increasing: true,
      icon: <Bot className="h-5 w-5 text-orange-500" />
    }
  ];

  // Recent conversations
  const recentConversations = [
    {
      id: 1,
      user: "Sarah Johnson",
      time: "10 min ago",
      status: "resolved",
      channel: "Website Chat",
      message: "I need help updating my billing information."
    },
    {
      id: 2,
      user: "David Williams",
      time: "32 min ago",
      status: "resolved",
      channel: "Email",
      message: "How do I cancel my subscription?"
    },
    {
      id: 3,
      user: "Maria Garcia",
      time: "1 hour ago",
      status: "agent",
      channel: "SMS",
      message: "The dashboard isn't loading correctly."
    },
    {
      id: 4,
      user: "Robert Chen",
      time: "3 hours ago",
      status: "resolved",
      channel: "Website Chat",
      message: "Can I upgrade my plan from the dashboard?"
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Here's what's happening with your organization today.</p>
        </div>
        <div className="ml-auto">
          <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-full">
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <span 
                      className={`ml-2 text-sm font-medium flex items-center ${
                        stat.increasing ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {stat.increasing ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-md bg-card border border-border">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Conversations Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Daily conversation volume</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversationData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
            <CardDescription>Average response time in seconds</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ strokeWidth: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Satisfaction */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Satisfaction</CardTitle>
            <CardDescription>Feedback ratings breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={satisfactionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {satisfactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[index % SATISFACTION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Method */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Resolution Method</CardTitle>
            <CardDescription>AI vs human agent assistance</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolutionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {resolutionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RESOLUTION_COLORS[index % RESOLUTION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>Latest customer interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Message</th>
                  <th className="text-left py-3 px-4 font-medium">Channel</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentConversations.map((conversation) => (
                  <tr key={conversation.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">{conversation.user}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{conversation.message}</td>
                    <td className="py-3 px-4">{conversation.channel}</td>
                    <td className="py-3 px-4">
                      {conversation.status === "resolved" ? (
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span>AI Resolved</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                          <span>Agent Assigned</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{conversation.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
