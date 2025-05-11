import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BarChart2, Calendar, ArrowUpRight, ArrowDownRight, Clock, Users, Phone, MessageSquare, CheckCircle, ChevronDown, Info } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Sector,
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

// Custom tooltip component for the pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs animate-in fade-in duration-300">
        <div className="flex items-center mb-2">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: payload[0].color }}
          />
          <span className="font-medium text-gray-900">{data.name}</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{data.value} calls</div>
        <div className="text-sm text-gray-500">
          {(payload[0].percent * 100).toFixed(1)}% of total
        </div>
      </div>
    );
  }
  return null;
};

// Custom active shape for the pie chart with hover effect
const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#333" className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#333" className="text-lg font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
    </g>
  );
};

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<AnalyticsOverview | null>(null);
  const [dailyData, setDailyData] = useState<DailyCallCount[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [timeRange, setTimeRange] = useState(7); // Default to last 7 days
  const [avgDuration, setAvgDuration] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

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
    fetchAverageDuration();
  }, [user, timeRange]); // Refetch if user or timeRange changes

  // Prepare data for Pie chart (needs name/value format)
  const pieChartData = statusData.map(item => ({
    name: item.status, 
    value: item.status_count
  }));

  // Function to fetch the average call duration
  const fetchAverageDuration = async () => {
    if (!user) return;
    
    try {
      // First check if the function exists
      const { data: functionExists, error: checkError } = await supabase
        .rpc('get_average_call_duration', { p_user_id: user.id })
        .maybeSingle();
        
      if (checkError && checkError.message.includes("function") && checkError.message.includes("does not exist")) {
        console.log("get_average_call_duration function does not exist yet");
        setAvgDuration(null);
        return;
      }
      
      const { data, error } = await supabase.rpc(
        'get_average_call_duration',
        { p_user_id: user.id }
      );
      
      if (error) throw error;
      
      setAvgDuration(data || null);
    } catch (error: any) {
      console.error("Error fetching average call duration:", error);
      setAvgDuration(null);
    }
  };

  // Format the average duration for display
  const formattedAvgDuration = avgDuration ? 
    `${Math.floor(avgDuration)}:${Math.round((avgDuration % 1) * 60).toString().padStart(2, '0')}` : 
    "N/A";

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

        <main className="flex-1 overflow-auto bg-white p-6">
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
                      <p className="text-3xl font-bold">{formattedAvgDuration}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {avgDuration !== null ? "Overall average" : "No data available"}
                      </p>
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
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Call Status Distribution</CardTitle>
                        <CardDescription>Breakdown of call status types</CardDescription>
                      </div>
                      <div className="p-1 bg-blue-50 rounded-full cursor-help group relative">
                        <Info className="h-4 w-4 text-blue-600" />
                        <div className="absolute right-0 mt-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10 text-xs text-gray-600">
                          This chart shows the distribution of calls by their status. Hover over segments for more details.
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[320px] flex items-center justify-center">
                      {pieChartData.length > 0 ? (
                        <div className="w-full h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={pieChartData}
                                cx="50%"
                                cy="45%"
                                innerRadius={40}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                                paddingAngle={2}
                                animationBegin={0}
                                animationDuration={1000}
                                animationEasing="ease-out"
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={STATUS_COLORS[entry.name] || STATUS_COLORS.default}
                                    className="transition-opacity hover:opacity-90 cursor-pointer"
                                    stroke="#fff"
                                    strokeWidth={1}
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomPieTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          {/* Legend */}
                          <div className="flex flex-wrap justify-center mt-2 gap-4">
                            {pieChartData.map((entry, index) => (
                              <div 
                                key={`legend-${index}`} 
                                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setActiveIndex(index)}
                              >
                                <div 
                                  className={`w-3 h-3 rounded-sm ${activeIndex === index ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                  style={{ backgroundColor: STATUS_COLORS[entry.name] || STATUS_COLORS.default }}
                                />
                                <span className="text-xs font-medium text-gray-700">
                                  {entry.name} ({entry.value})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
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
