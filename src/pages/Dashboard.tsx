
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
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");

  // Mock data
  const salesData = [
    { name: "Mon", value: 12500 },
    { name: "Tue", value: 18200 },
    { name: "Wed", value: 15800 },
    { name: "Thu", value: 22000 },
    { name: "Fri", value: 26500 },
    { name: "Sat", value: 19800 },
    { name: "Sun", value: 17300 }
  ];
  
  const productData = [
    { name: "Hydrate", value: 35 },
    { name: "Illuminate", value: 28 },
    { name: "Acne+", value: 22 },
    { name: "Mecca", value: 15 }
  ];
  
  const PRODUCT_COLORS = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c'];

  const channelData = [
    { name: "Website", value: 58 },
    { name: "Retail", value: 25 },
    { name: "Wholesale", value: 17 }
  ];
  
  const CHANNEL_COLORS = ['#aaff00', '#00a0e9', '#6366f1'];

  // Stats cards data
  const statsData = [
    {
      title: "Total Sales",
      value: "$136,240",
      change: "+12.5%",
      increasing: true,
      icon: <DollarSign className="h-5 w-5 text-black" />
    },
    {
      title: "Products",
      value: "45",
      change: "+8%",
      increasing: true,
      icon: <ShoppingBag className="h-5 w-5 text-black" />
    },
    {
      title: "Active Customers",
      value: "2,893",
      change: "+15.3%",
      increasing: true,
      icon: <Users className="h-5 w-5 text-black" />
    },
    {
      title: "Growth Rate",
      value: "24%",
      change: "+5.4%",
      increasing: true,
      icon: <TrendingUp className="h-5 w-5 text-black" />
    }
  ];

  // Recent orders
  const recentOrders = [
    {
      id: "ORD-001",
      product: "Hydrate Replenish",
      customer: "Sarah Johnson",
      date: "Today, 10:45 AM",
      amount: "$89.00",
      status: "completed"
    },
    {
      id: "ORD-002",
      product: "Illumination Mask",
      customer: "David Williams",
      date: "Today, 09:12 AM",
      amount: "$64.00",
      status: "processing"
    },
    {
      id: "ORD-003",
      product: "Act+ Acne Hair Mask",
      customer: "Maria Garcia",
      date: "Yesterday, 4:23 PM",
      amount: "$112.50",
      status: "completed"
    },
    {
      id: "ORD-004",
      product: "Mecca Cosmetica",
      customer: "Robert Chen",
      date: "Yesterday, 1:45 PM",
      amount: "$78.25",
      status: "completed"
    },
    {
      id: "ORD-005",
      product: "Hylamide Glow",
      customer: "Jennifer Lee",
      date: "Jul 24, 2023",
      amount: "$55.99",
      status: "processing"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
            <p className="text-muted-foreground">Here's what's happening with your products today.</p>
          </div>
          <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-auto">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="border border-gray-200">
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
                  <div className="p-2 rounded-md bg-gray-100">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sales Chart */}
          <Card className="col-span-2 border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Daily sales revenue</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#aaff00" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Most popular products by sales</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer purchases</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{order.id}</td>
                      <td className="py-3 px-4">{order.product}</td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4 text-gray-500">{order.date}</td>
                      <td className="py-3 px-4 font-medium">{order.amount}</td>
                      <td className="py-3 px-4">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status === 'completed' ? 'Completed' : 'Processing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
