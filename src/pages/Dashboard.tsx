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
  BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ZenithLogo from "@/components/ZenithLogo";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsOverview {
  total_calls: number;
  resolved_calls: number;
  resolution_rate: number;
}

interface DailyCallCount {
  call_day: string;
  call_count: number;
}

interface RecentCall {
  id: string;
  caller_number: string | null;
  call_datetime: string;
  status: string;
  notes: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<AnalyticsOverview | null>(null);
  const [dailyData, setDailyData] = useState<DailyCallCount[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const subscriptionStatus = searchParams.get('subscription');
  
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
        const formattedDailyData = (dailyResult.data || []).map(d => ({
          call_day: new Date(d.call_day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          call_count: d.call_count
        }));
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

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <DashboardLayout>
      <div className="w-full h-full p-0 m-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 px-4 pt-4">
            <h1 className="text-2xl font-semibold text-gray-900">Hello, {firstName}!</h1>
            <p className="text-sm text-gray-600">Welcome back, here's your dashboard overview.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 mb-6">
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
                      <p className="text-4xl font-bold mt-1">N/A</p>
                    )}
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
                <CardTitle className="text-lg font-semibold">Call Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loading />
                    </div>
                  ) : dailyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dailyData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="call_day" 
                          tick={{ fontSize: 12 }} 
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
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="call_count" 
                          stroke="#1a56db" 
                          activeDot={{ r: 6 }} 
                          dot={{ r: 4 }}
                          strokeWidth={2}
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
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Recent Calls</CardTitle>
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
                        <div key={call.id} className="flex items-center px-6 py-3 hover:bg-gray-50">
                          <div className="flex-shrink-0 mr-3">
                            <Avatar className="h-9 w-9 bg-blue-100">
                              <AvatarFallback className="text-blue-700 font-medium">
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
                            className={`${
                              call.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                              call.status === 'missed' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                              'bg-blue-100 text-blue-800 hover:bg-blue-100'
                            } text-xs font-medium h-6`}
                          >
                            {call.status}
                          </Badge>
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
                      className="w-full text-[#1a56db] border-[#1a56db] hover:bg-[#1a56db] hover:text-white"
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
