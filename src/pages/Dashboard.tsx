import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Link, useSearchParams } from "react-router-dom";
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
  Area,
  ReferenceArea,
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
  User,
  CheckCircle,
  ArrowRight,
  BarChart2,
  TrendingUp,
  TrendingDown,
  ZoomIn,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ZenithLogo from "@/components/ZenithLogo";
import AIRIESLogo from "@/components/AIRIESLogo";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import NoUserSelected from "@/components/NoUserSelected";
import CompanyPhoneNumber from "@/components/CompanyPhoneNumber";

interface AnalyticsOverview {
  total_calls: number;
  resolved_calls: number;
  resolution_rate: number;
}

interface DailyCallCount {
  call_day: string;
  call_count: number;
  date_obj?: Date; // For sorting and calculations
  trend?: number; // For tracking day-to-day changes
}

interface RecentCall {
  id: string;
  caller_number: string | null;
  call_datetime: string;
  status: string;
  notes: string | null;
}

// Custom tooltip for the line chart on dashboard
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const callCount = data.call_count;
    const dateStr = data.call_day;
    const isIncreasing = payload[0].payload.trend > 0;
    const trendPercent = Math.abs(payload[0].payload.trend || 0);
    const showTrend = payload[0].payload.trend !== undefined;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px] animate-in fade-in duration-200">
        <p className="font-medium text-gray-900 mb-2">{dateStr}</p>
        <div className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
          {callCount} {callCount === 1 ? 'call' : 'calls'}
        </div>
        {showTrend && (
          <div className={`flex items-center text-sm gap-1 ${isIncreasing ? 'text-green-600' : 'text-red-600'}`}>
            {isIncreasing ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trendPercent}% {isIncreasing ? 'more' : 'fewer'} than previous</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedUser, userRequired } = useUser();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<AnalyticsOverview | null>(null);
  const [dailyData, setDailyData] = useState<DailyCallCount[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [avgDuration, setAvgDuration] = useState<number | null>(null);
  const [focusBar, setFocusBar] = useState<number | null>(null);
  const [lineChartZoomed, setLineChartZoomed] = useState(false);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const subscriptionStatus = searchParams.get('subscription');
  
  const onLineChartBarClick = (data: any, index: number) => {
    setFocusBar(index === focusBar ? null : index);
  };
  
  const toggleLineChartZoom = () => {
    setLineChartZoomed(!lineChartZoomed);
  };
  
  const toggleCallDetails = (callId: string) => {
    setExpandedCall(expandedCall === callId ? null : callId);
  };
  
  if (userRequired && !selectedUser) {
    return <NoUserSelected />;
  }

  useEffect(() => {
    if (subscriptionStatus === 'success') {
      toast.success('Subscription activated successfully! Welcome to the premium plan.');
      
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.toString());
    }
  }, [subscriptionStatus]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [overviewResult, dailyResult, recentCallsResult] = await Promise.all([
          supabase.rpc('get_analytics_overview'),
          supabase.rpc('get_daily_call_counts', { days_count: 7 }),
          supabase.from('calls').select('*').order('call_datetime', { ascending: false }).limit(5)
        ]);

        if (overviewResult.error) throw overviewResult.error;
        setOverviewData(overviewResult.data?.[0] || { total_calls: 0, resolved_calls: 0, resolution_rate: 0 });

        if (dailyResult.error) throw dailyResult.error;
        // Format daily data for the chart with trend calculation
        const sortedData = [...(dailyResult.data || [])].sort((a, b) => 
          new Date(a.call_day).getTime() - new Date(b.call_day).getTime()
        );
        
        const formattedDailyData = sortedData.map((d, index) => {
          const dateObj = new Date(d.call_day);
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          // Calculate trend compared to previous day if available
          let trend;
          if (index > 0) {
            const prev = sortedData[index-1].call_count;
            const current = d.call_count;
            if (prev > 0) {
              trend = Math.round(((current - prev) / prev) * 100);
            } else if (current > 0) {
              trend = 100; // If previous was 0 and current is > 0, 100% increase
            } else {
              trend = 0;
            }
          }
          
          return {
            call_day: formattedDate,
            call_count: d.call_count,
            date_obj: dateObj,
            trend
          };
        });
        setDailyData(formattedDailyData);

        if (recentCallsResult.error) throw recentCallsResult.error;
        setRecentCalls(recentCallsResult.data || []);

      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast.error(`Failed to load dashboard data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchAverageDuration();

    const callsSubscription = supabase
      .channel('dashboard-calls-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls' }, (payload) => {
        console.log("New call detected on dashboard:", payload.new);
        setRecentCalls(prev => [payload.new as RecentCall, ...prev].slice(0, 5));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(callsSubscription);
    };

  }, [user]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
    } catch (e) { return 'Invalid Date'; }
  };

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

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <DashboardLayout>
      <div className="flex-1 h-screen overflow-y-auto bg-white">
        <div className="max-w-[2000px] mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-2">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Hello, {firstName}!</h1>
                <p className="text-sm text-gray-600">Welcome back, here's your dashboard overview.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CompanyPhoneNumber />
            <Card className="bg-[#1a56db] text-white rounded-lg shadow-md overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-100">Total Calls</p>
                    {loading ? (
                      <Skeleton className="h-10 w-20 mt-1 bg-[#3b75e0]" />
                    ) : (
                      <p className="text-4xl font-bold mt-1">{overviewData?.total_calls ?? 0}</p>
                    )}
                  </div>
                  <div className="p-3 bg-[#3b75e0] bg-opacity-50 rounded-full">
                    <Phone className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1b1f24] text-white rounded-lg shadow-md overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Avg. Duration</p>
                    {loading ? (
                      <Skeleton className="h-10 w-20 mt-1 bg-gray-700" />
                    ) : (
                      <p className="text-4xl font-bold mt-1">{formattedAvgDuration}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      {avgDuration !== null ? "Overall average" : "No data available"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-700 bg-opacity-50 rounded-full">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1f3b8a] text-white rounded-lg shadow-md overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-100">Resolution Rate</p>
                    {loading ? (
                      <Skeleton className="h-10 w-20 mt-1 bg-[#3659b5]" />
                    ) : (
                      <p className="text-4xl font-bold mt-1">{Math.round(overviewData?.resolution_rate ?? 0)}%</p>
                    )}
                  </div>
                  <div className="p-3 bg-[#3659b5] bg-opacity-50 rounded-full">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 mb-6">
            <Card className="col-span-1 lg:col-span-2 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-semibold">Call Activity</CardTitle>
                    <p className="text-sm text-gray-500">Call volume over the past 7 days</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleLineChartZoom}
                      className="p-1.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                      title={lineChartZoomed ? "Reset view" : "Enhance view"}
                    >
                      <ZoomIn className="h-4 w-4 text-blue-600" />
                    </button>
                    <div className="p-1.5 bg-blue-50 rounded-full cursor-help group relative">
                      <Info className="h-4 w-4 text-blue-600" />
                      <div className="absolute right-0 mt-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10 text-xs text-gray-600">
                        Click on any point to focus on it. The chart shows day-to-day call volume with percentage changes.
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${lineChartZoomed ? 'h-[380px]' : 'h-[300px]'} w-full transition-all duration-300`}>
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loading />
                    </div>
                  ) : dailyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dailyData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                        onClick={(data) => data && data.activeTooltipIndex !== undefined && onLineChartBarClick(data, data.activeTooltipIndex)}
                      >
                        <defs>
                          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1a56db" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#1a56db" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" opacity={0.6} />
                        <XAxis 
                          dataKey="call_day" 
                          tick={({ x, y, payload, index }) => {
                            const isFocused = index === focusBar;
                            return (
                              <text 
                                x={x} 
                                y={y + 10} 
                                textAnchor="middle" 
                                fill={isFocused ? "#1a56db" : "#6b7280"}
                                fontSize={isFocused ? 13 : 12}
                                fontWeight={isFocused ? "bold" : "normal"}
                              >
                                {payload.value}
                              </text>
                            );
                          }}
                          tickLine={false}
                          axisLine={{ stroke: '#e0e0e0' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                          axisLine={{ stroke: '#e0e0e0' }}
                          tickFormatter={(value) => value.toFixed(0)}
                        />
                        <Tooltip 
                          content={<CustomLineTooltip />}
                          cursor={{ 
                            stroke: '#1a56db', 
                            strokeWidth: 1, 
                            strokeDasharray: '3 3',
                            fill: 'rgba(219, 234, 254, 0.2)' 
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="call_count" 
                          stroke="none" 
                          fill="url(#colorCalls)" 
                          fillOpacity={1}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="call_count" 
                          stroke="#1a56db" 
                          strokeWidth={3} 
                          dot={({ cx, cy, index }) => (
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={index === focusBar ? 6 : 4} 
                              stroke={index === focusBar ? "#1E3A8A" : "#1a56db"} 
                              strokeWidth={index === focusBar ? 3 : 2} 
                              fill={index === focusBar ? "#1a56db" : "white"} 
                              className="transition-all duration-300"
                              cursor="pointer"
                            />
                          )} 
                          activeDot={{ 
                            stroke: '#1E3A8A', 
                            strokeWidth: 3, 
                            r: 7, 
                            fill: '#1a56db' 
                          }}
                          animationDuration={1000}
                          animationEasing="ease-out"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Phone className="h-10 w-10 mb-2 text-gray-300" />
                      <p>No call data available for this period</p>
                    </div>
                  )}
                </div>
                
                {dailyData.length > 0 && !loading && !lineChartZoomed && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1">Average Calls/Day</p>
                      <p className="text-lg font-medium">
                        {(dailyData.reduce((acc, day) => acc + day.call_count, 0) / dailyData.length).toFixed(1)}
                      </p>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1">Highest Volume</p>
                      <p className="text-lg font-medium">
                        {Math.max(...dailyData.map(day => day.call_count))}
                      </p>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1">Recent Trend</p>
                      {dailyData.length >= 2 && (
                        <div className="flex items-center gap-1">
                          {dailyData[dailyData.length-1].call_count > dailyData[dailyData.length-2].call_count ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <p className="text-lg font-medium text-green-600">Up</p>
                            </>
                          ) : dailyData[dailyData.length-1].call_count < dailyData[dailyData.length-2].call_count ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              <p className="text-lg font-medium text-red-600">Down</p>
                            </>
                          ) : (
                            <p className="text-lg font-medium text-gray-600">Steady</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">Recent Calls</CardTitle>
                  <div className="p-1.5 bg-blue-50 rounded-full cursor-help group relative">
                    <Info className="h-4 w-4 text-blue-600" />
                    <div className="absolute right-0 mt-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10 text-xs text-gray-600">
                      Click on any call to view more details. Shows your most recent calls with status indicators.
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-hidden">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))
                  ) : recentCalls.length > 0 ? (
                    <div className="space-y-1">
                      {recentCalls.map((call) => (
                        <div key={call.id}>
                          <div 
                            onClick={() => toggleCallDetails(call.id)}
                            className="flex items-center px-6 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            <div className="flex-shrink-0 mr-3">
                              <Avatar className={`h-9 w-9 ${call.status === 'Resolved' ? 'bg-green-100' : call.status === 'Pending' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                                <AvatarFallback className={`${call.status === 'Resolved' ? 'text-green-700' : call.status === 'Pending' ? 'text-yellow-700' : 'text-blue-700'} font-medium`}>
                                  {call.caller_number ? call.caller_number.substring(0, 2) : 'NA'}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {call.caller_number || 'Unknown Number'}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock4 className="h-3 w-3" />
                                {formatDate(call.call_datetime)}
                              </p>
                            </div>
                            <Badge 
                              className={`${call.status === 'Resolved' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                call.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 
                                'bg-blue-100 text-blue-800 hover:bg-blue-200'} text-xs font-medium h-6`}
                            >
                              {call.status}
                            </Badge>
                          </div>
                          
                          {/* Expanded call details */}
                          {expandedCall === call.id && (
                            <div className="px-6 py-3 bg-blue-50 border-y border-blue-100 animate-in fade-in duration-200">
                              <div className="flex flex-col space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs font-medium text-gray-500">Call Date:</span>
                                  <span className="text-xs text-gray-700">{new Date(call.call_datetime).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs font-medium text-gray-500">Call Time:</span>
                                  <span className="text-xs text-gray-700">{new Date(call.call_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs font-medium text-gray-500">Status:</span>
                                  <span className="text-xs text-gray-700">{call.status}</span>
                                </div>
                                {call.notes && (
                                  <div className="mt-2">
                                    <span className="text-xs font-medium text-gray-500 block mb-1">Notes:</span>
                                    <div className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 max-h-20 overflow-y-auto">
                                      {call.notes}
                                    </div>
                                  </div>
                                )}
                                <div className="pt-2">
                                  <Link to={`/call-history?call=${call.id}`} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 w-fit">
                                    View full details
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Phone className="h-10 w-10 mb-2 text-gray-300" />
                      <p>No recent calls</p>
                    </div>
                  )}
                </div>
                <div className="px-6 pt-4">
                  <Link to="/call-history">
                    <Button 
                      variant="outline" 
                      className="w-full text-[#1a56db] border-[#1a56db] hover:bg-[#1a56db] hover:text-white transition-colors"
                    >
                      View All Call History
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
