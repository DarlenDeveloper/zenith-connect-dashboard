import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BarChart2, Calendar, ArrowUpRight, ArrowDownRight, Clock, Users, Phone, MessageSquare, CheckCircle } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  Resolved: '#10B981', // Green
  Unresolved: '#F59E0B', // Amber (Used for Pending)
  Pending: '#F59E0B', // Explicitly map Pending too
  'Needs Review': '#3B82F6', // Blue
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
            {/* Time Range Selector (Example) */}
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
            {/* Export button can be added later */}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-6">
          {loading ? (
            <div className="text-center p-10">Loading analytics...</div>
          ) : (
            <>
              {/* Stats overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-blue-100 rounded-md">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{overviewData?.total_calls ?? 0}</h3>
                    <p className="text-sm text-gray-500">Total Calls</p>
                  </div>
                </Card>
                
                <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-green-100 rounded-md">
                      <CheckCircle className="h-6 w-6 text-green-600" /> {/* Changed Icon */} 
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{Math.round(overviewData?.resolution_rate ?? 0)}%</h3>
                    <p className="text-sm text-gray-500">Resolution Rate</p>
                  </div>
                </Card>
                
                <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                   {/* Placeholder for Avg Call Time - needs duration data */}
                   <div className="flex justify-between items-start mb-3">
                     <div className="p-2 bg-purple-100 rounded-md">
                      <Clock className="h-6 w-6 text-purple-600" />
                     </div>
                   </div>
                   <div>
                     <h3 className="text-3xl font-bold text-gray-900 mb-1">N/A</h3>
                     <p className="text-sm text-gray-500">Average Call Time</p>
                   </div>
                </Card>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Daily Call Activity Chart */}
                <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-gray-700">Call Activity</h3>
                    <p className="text-sm text-gray-500">Last {timeRange} days</p>
                  </div>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="call_day" axisLine={false} tickLine={false} stroke="#6b7280" fontSize={12} dy={10}/>
                        <YAxis axisLine={false} tickLine={false} stroke="#6b7280" fontSize={12} dx={-10} allowDecimals={false}/>
                        <Tooltip cursor={{ fill: 'rgba(235, 254, 238, 0.5)' }} contentStyle={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: '#1f2937', border: '1px solid #e5e7eb' }} formatter={(value: number) => [`${value}`, 'Calls']}/>
                        <Line type="monotone" dataKey="call_count" stroke="#10B981" strokeWidth={2.5} dot={{ stroke: '#10B981', strokeWidth: 2, r: 4, fill: 'white' }} activeDot={{ stroke: '#10B981', strokeWidth: 2, r: 6, fill: '#10B981' }}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Call Status Distribution Chart */}
                <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-gray-700">Call Status</h3>
                  </div>
                  <div className="h-60 flex items-center justify-center">
                    {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.default} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number, name: string) => [`${value} calls`, name]}/>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500">(No status data)</p>
                    )}
                  </div>
                </Card>
              </div>
              
              {/* Removed unused chart/card placeholders */}
            </>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
