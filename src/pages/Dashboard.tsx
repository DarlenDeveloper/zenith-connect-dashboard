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
          <div className="mb-4 lg:mb-4 px-4 lg:px-4 pt-4 lg:pt-4">
            <h1 className="text-2xl font-semibold text-gray-900">Hello, {firstName}!</h1>
            <p className="text-sm text-gray-600">Welcome back, here's your dashboard overview.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-4 mb-6">
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

          <div className="flex items-center justify-between px-4 mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-gray-800">Activity Summary</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-4 pb-6">
            <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-md">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium text-gray-800">Call Activity</CardTitle>
                  <p className="text-sm text-gray-500">Last 7 days</p>
                </div>
              </CardHeader>
              <CardContent className="p-5 lg:p-6">
                <div className="h-60">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <Skeleton className="h-[200px] w-full rounded-md" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="call_day" axisLine={false} tickLine={false} stroke="#6b7280" fontSize={12} dy={10} />
                        <YAxis axisLine={false} tickLine={false} stroke="#6b7280" fontSize={12} dx={-10} allowDecimals={false} />
                        <Tooltip cursor={{ fill: 'rgba(229, 245, 235, 0.7)' }} contentStyle={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: '#1f2937', border: '1px solid #e5e7eb' }} formatter={(value: number) => [`${value}`, 'Calls']} />
                        <Line type="monotone" dataKey="call_count" stroke="#1a56db" strokeWidth={2.5} dot={{ stroke: '#1a56db', strokeWidth: 2, r: 4, fill: 'white' }} activeDot={{ stroke: '#1a56db', strokeWidth: 2, r: 6, fill: '#1a56db' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1 bg-white border border-gray-200 rounded-lg shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-gray-800">Recent Calls</CardTitle>
                <Link to="/call-history" className="text-sm text-[#1a56db] hover:underline flex items-center">
                  <span className="mr-1">View All</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : recentCalls.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No recent calls found.</p>
                  ) : (
                    recentCalls.map((call) => (
                      <div key={call.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 bg-gray-100">
                            <AvatarFallback>
                              <User className="h-5 w-5 text-gray-500" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{call.caller_number || 'Unknown Caller'}</p>
                            <p className="text-xs text-gray-500">{formatDate(call.call_datetime)}</p>
                          </div>
                        </div>
                        <Badge 
                          className={`
                            ${call.status === "Resolved" ? "bg-green-100 text-green-800 border-green-200" : 
                              call.status === "Unresolved" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : 
                              "bg-blue-100 text-blue-800 border-blue-200"}
                            text-xs font-medium px-2.5 py-0.5 rounded
                          `}
                        >
                          {call.status === 'Unresolved' ? 'Pending' : call.status}
                        </Badge>
                      </div>
                    ))
                  )}
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
