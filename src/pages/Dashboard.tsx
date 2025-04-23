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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ZenithLogo from "@/components/ZenithLogo";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-4 mb-4 lg:mb-4">
            <Card className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{loading ? '-' : overviewData?.total_calls ?? 0}</h3>
                <p className="text-sm text-gray-500">Total Calls</p>
              </div>
            </Card>
            <Card className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-green-100 rounded-md">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{loading ? '-' : Math.round(overviewData?.resolution_rate ?? 0)}%</h3>
                <p className="text-sm text-gray-500">Resolution Rate</p>
              </div>
            </Card>
            <Card className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-5">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-4 pb-4 lg:pb-4">
            <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-5 lg:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium text-gray-700">Call Activity</h3>
                  <p className="text-sm text-gray-500">Last 7 days</p>
                </div>
                <div className="h-60">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Loading chart data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="call_day" axisLine={false} tickLine={false} stroke="#6b7280" fontSize={12} dy={10} />
                        <YAxis axisLine={false} tickLine={false} stroke="#6b7280" fontSize={12} dx={-10} allowDecimals={false} />
                        <Tooltip cursor={{ fill: 'rgba(229, 245, 235, 0.7)' }} contentStyle={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: '#1f2937', border: '1px solid #e5e7eb' }} formatter={(value: number) => [`${value}`, 'Calls']} />
                        <Line type="monotone" dataKey="call_count" stroke="#10B981" strokeWidth={2.5} dot={{ stroke: '#10B981', strokeWidth: 2, r: 4, fill: 'white' }} activeDot={{ stroke: '#10B981', strokeWidth: 2, r: 6, fill: '#10B981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Recent Calls</CardTitle>
                <Link to="/call-history" className="text-sm text-blue-600 hover:underline flex items-center">
                  <span className="mr-1">View All</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-sm text-gray-500">(Loading recent calls...)</p>
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
                        <Badge variant={call.status === "Resolved" ? "default" : call.status === "Unresolved" ? "destructive" : "secondary"} className={`text-xs ${call.status === "Resolved" ? "bg-green-100 text-green-800 border-green-200" : call.status === "Unresolved" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}>
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
