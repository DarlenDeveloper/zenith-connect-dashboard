import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BarChart2, Calendar, ArrowUpRight, ArrowDownRight, Clock, Users, Phone, MessageSquare, CheckCircle, ChevronDown } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Interface for overview data
interface AnalyticsOverview {
  total_calls: number;
  resolved_calls: number;
  resolution_rate: number;
  // Add avg_duration later if needed
}

// Interface for daily call counts
interface DailyCallCount {
  call_day: string; // Date string
  call_count: number;
}

// Interface for status counts
interface StatusCount {
  status: string;
  status_count: number;
}

// Define colors for the Pie chart
const STATUS_COLORS: { [key: string]: string } = {
  Resolved: '#2563EB', // Blue
  Unresolved: '#334155', // Dark Gray (Used for Pending)
  Pending: '#334155', // Explicitly map Pending too
  'Needs Review': '#1E40AF', // Darker Blue
  default: '#6B7280' // Gray for any other status
};

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<AnalyticsOverview | null>(null);
  const [dailyData, setDailyData] = useState<DailyCallCount[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [timeRange, setTimeRange] = useState(7); // Default to last 7 days

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Call the database functions using RPC
      const [overviewResult, dailyResult, statusResult] = await Promise.all([
        supabase.rpc('get_analytics_overview'),
        supabase.rpc('get_daily_call_counts', { days_count: timeRange }),
        supabase.rpc('get_calls_by_status')
      ]);

      // Check for errors and process data
      if (overviewResult.error) throw overviewResult.error;
      setOverviewData(overviewResult.data?.[0] || { total_calls: 0, resolved_calls: 0, resolution_rate: 0 });

      if (dailyResult.error) throw dailyResult.error;
      // Format daily data for the chart
      const formattedDailyData = (dailyResult.data || []).map(d => ({
        call_day: new Date(d.call_day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Format date
        call_count: d.call_count
      }));
      setDailyData(formattedDailyData);

      if (statusResult.error) throw statusResult.error;
      // Format status data for the chart (map Unresolved to Pending for display)
      const formattedStatusData = (statusResult.data || []).map(s => ({
        status: s.status === 'Unresolved' ? 'Pending' : s.status,
        status_count: s.status_count
      }));
      setStatusData(formattedStatusData);

    } catch (error: any) {
      console.error("Error fetching analytics data:", error);
      toast.error(`Failed to load analytics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return; // Wait for user
    fetchAnalyticsData();
  }, [user, timeRange]); // Refetch if user or timeRange changes

  // Prepare data for Pie chart (needs name/value format)
  const pieChartData = statusData.map(item => ({
    name: item.status, 
    value: item.status_count
  }));

  const timeRangeLabels = {
    7: 'Last 7 Days',
    30: 'Last 30 Days', 
    90: 'Last 90 Days'
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <header className="h-16 shrink-0 bg-white flex items-center px-6 justify-between border-b border-gray-100 shadow-sm">
          <div className="flex items-center">
            <BarChart2 className="mr-2 h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
          </div>
          <div className="flex gap-2">
            {/* Time Range Selector (Dropdown) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {timeRangeLabels[timeRange as keyof typeof timeRangeLabels]}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => setTimeRange(7)}>Last 7 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange(30)}>Last 30 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange(90)}>Last 90 Days</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <Loading text="Loading analytics" size="md" />
            </div>
          ) : (
            <>
              {/* Stats overview with gradient cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">Total Calls</p>
                      <p className="text-3xl font-bold">{overviewData?.total_calls ?? 0}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-3">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium mb-1">Average Call Time</p>
                      <p className="text-3xl font-bold">N/A</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-3">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm font-medium mb-1">Resolution Rate</p>
                      <p className="text-3xl font-bold">{Math.round(overviewData?.resolution_rate ?? 0)}%</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Call Activity Chart */}
                <Card className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border-none">
                  <CardHeader className="pb-0">
                    <CardTitle>Call Activity</CardTitle>
                    <CardDescription>Call volume over the past {timeRange} days</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="call_day" axisLine={false} tickLine={false} stroke="#6b7280" fontSize={12} dy={10}/>
                          <YAxis axisLine={false} tickLine={false} stroke="#6b7280" fontSize={12} dx={-10} allowDecimals={false}/>
                          <Tooltip 
                            cursor={{ fill: 'rgba(219, 234, 254, 0.3)' }} 
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
                            dataKey="call_count" 
                            stroke="#2563EB" 
                            strokeWidth={2.5} 
                            dot={{ stroke: '#2563EB', strokeWidth: 2, r: 4, fill: 'white' }} 
                            activeDot={{ stroke: '#2563EB', strokeWidth: 2, r: 6, fill: '#2563EB' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Call Status Distribution Chart */}
                <Card className="bg-white rounded-xl shadow-md overflow-hidden border-none">
                  <CardHeader className="pb-0">
                    <CardTitle>Call Status Distribution</CardTitle>
                    <CardDescription>Breakdown of call status types</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[300px] flex items-center justify-center">
                      {pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={90}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.default} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number, name: string) => [`${value} calls`, name]}
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
                      ) : (
                        <div className="text-center text-gray-500">
                          <p>No status data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
