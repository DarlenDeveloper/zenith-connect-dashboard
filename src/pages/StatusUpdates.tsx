import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  XOctagon,
  Info,
  ArrowUpRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Server,
  Cpu,
  Shield,
  Globe,
  MessageSquare,
  Clock,
  Calendar,
  Users,
  Activity,
  ArrowRight,
  X,
  PlayCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

// Interface for System Status
interface SystemComponentStatus {
  id: string;
  component_name: string;
  status: string; // Operational, Degraded, Outage
  message: string | null;
  last_updated: string;
  uptime_percentage?: number; // Added for uptime visualization
  icon?: string; // Added for identifying component type
}

// Interface for Announcements
interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  priority?: 'low' | 'medium' | 'high'; // Added for priority visualization
  category?: string; // For categorizing announcements
  read?: boolean; // To track if user has read the announcement
}

// Interface for Incident
interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  affected_components: string[]; // IDs of affected components
}

// Interface for System Metrics
interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  status: 'good' | 'warning' | 'critical';
}

const StatusUpdates = () => {
  const { user } = useAuth();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced state management
  const [statusList, setStatusList] = useState<SystemComponentStatus[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('status');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [showAllIncidents, setShowAllIncidents] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState('24h'); // '24h', '7d', '30d'

  // Enhanced fetch functions for all data types
  const fetchSystemStatus = async () => {
    setLoadingStatus(true);
    try {
      const { data, error } = await supabase
        .from('system_status')
        .select('*')
        .order('component_name', { ascending: true });
      
      if (error) throw error;
      
      // Enhance the data with default values for new properties
      const enhancedData = (data || []).map(component => ({
        ...component,
        // Add default uptime percentage (in a real app, this would come from the backend)
        uptime_percentage: component.status === 'Operational' ? 99.9 : 
                          component.status === 'Degraded' ? 95.5 : 75.2,
        // Add icon based on component name (in a real app, this would be stored in the database)
        icon: component.component_name.includes('Voice') ? 'voice' :
              component.component_name.includes('Processing') ? 'processing' :
              component.component_name.includes('Dashboard') ? 'dashboard' : 'default'
      }));
      
      setStatusList(enhancedData);
      setLastRefreshed(new Date());
    } catch (error: any) {
      toast.error(`Failed to load system status: ${error.message}`);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Fetch Announcements with enhanced data
  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Enhance announcements with priority and read status
      const enhancedAnnouncements = (data || []).map((announcement, index) => ({
        ...announcement,
        priority: index === 0 ? 'high' : index < 3 ? 'medium' : 'low' as 'high' | 'medium' | 'low',
        category: index % 3 === 0 ? 'Feature Update' : 
                 index % 3 === 1 ? 'Maintenance' : 'Security',
        read: false
      }));
      
      setAnnouncements(enhancedAnnouncements);
    } catch (error: any) {
      toast.error(`Failed to load announcements: ${error.message}`);
    } finally {
      setLoadingAnnouncements(false);
    }
  };
  
  // New functions to fetch incidents and metrics
  const fetchIncidents = async () => {
    setLoadingIncidents(true);
    try {
      // In a real app, this would come from the database
      // Mocking incidents data for demonstration
      const mockIncidents: Incident[] = [
        {
          id: '1',
          title: 'Voice Service Latency',
          description: 'We are investigating reports of increased latency in our voice recognition service.',
          status: 'resolved',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          affected_components: ['1'] // Voice service ID
        },
        {
          id: '2',
          title: 'Dashboard Loading Issues',
          description: 'Some users are experiencing slow loading times for dashboard visualizations.',
          status: 'monitoring',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
          affected_components: ['3'] // Dashboard ID
        }
      ];
      
      setIncidents(mockIncidents);
    } catch (error: any) {
      toast.error(`Failed to load incidents: ${error.message}`);
    } finally {
      setLoadingIncidents(false);
    }
  };
  
  const fetchSystemMetrics = async () => {
    setLoadingMetrics(true);
    try {
      // In a real app, this would come from the database
      // Mocking metrics data for demonstration
      const mockMetrics: SystemMetric[] = [
        {
          id: '1',
          name: 'System Response Time',
          value: 124,
          unit: 'ms',
          timestamp: new Date().toISOString(),
          status: 'good'
        },
        {
          id: '2',
          name: 'API Success Rate',
          value: 99.8,
          unit: '%',
          timestamp: new Date().toISOString(),
          status: 'good'
        },
        {
          id: '3',
          name: 'Active Users',
          value: 1250,
          unit: 'users',
          timestamp: new Date().toISOString(),
          status: 'good'
        },
        {
          id: '4',
          name: 'Memory Usage',
          value: 78,
          unit: '%',
          timestamp: new Date().toISOString(),
          status: 'warning'
        }
      ];
      
      setSystemMetrics(mockMetrics);
    } catch (error: any) {
      toast.error(`Failed to load system metrics: ${error.message}`);
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Initial fetch
  // Refresh all data
  const refreshAllData = () => {
    fetchSystemStatus();
    fetchAnnouncements();
    fetchIncidents();
    fetchSystemMetrics();
    setLastRefreshed(new Date());
    toast.success('All system data refreshed');
  };
  
  // Auto-refresh functionality
  const startAutoRefresh = (intervalMinutes = 5) => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Set new timeout
    refreshTimeoutRef.current = setTimeout(() => {
      refreshAllData();
      startAutoRefresh(intervalMinutes); // Restart the cycle
    }, intervalMinutes * 60 * 1000);
  };
  
  // Toggle announcement expansion
  const toggleAnnouncementExpand = (id: string) => {
    setExpandedAnnouncement(expandedAnnouncement === id ? null : id);
    
    // Mark as read if expanded
    if (expandedAnnouncement !== id) {
      setAnnouncements(prevAnnouncements => 
        prevAnnouncements.map(ann => 
          ann.id === id ? { ...ann, read: true } : ann
        )
      );
    }
  };

  // Initial data loading
  useEffect(() => {
    if (!user) return;
    
    // Load all data
    fetchSystemStatus();
    fetchAnnouncements();
    fetchIncidents();
    fetchSystemMetrics();
    
    // Start auto-refresh
    startAutoRefresh();

    // Set up real-time subscriptions
    const statusSubscription = supabase
      .channel('system-status-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_status' }, 
          () => fetchSystemStatus())
      .subscribe();
    
    const announcementSubscription = supabase
      .channel('announcements-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, 
          () => fetchAnnouncements())
      .subscribe();

    // Cleanup function
    return () => {
      // Remove subscriptions
      supabase.removeChannel(statusSubscription);
      supabase.removeChannel(announcementSubscription);
      
      // Clear auto-refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user]);

  // Enhanced helper functions for the new UI
  
  // Format date with multiple options
  const formatDate = (dateString: string | null, format: 'full' | 'relative' | 'time' = 'full') => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      
      switch (format) {
        case 'relative':
          return formatDistanceToNow(date, { addSuffix: true });
        case 'time':
          return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
        case 'full':
        default:
          return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
      }
    } catch (e) { 
      return 'Invalid Date'; 
    }
  };

  // Enhanced status presentation with more visual options
  const getStatusPresentation = (status: string) => {
    switch (status) {
      case 'Operational':
        return { 
          indicatorColor: 'bg-green-500', 
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700', 
          statusText: 'Operational',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />
        };
      case 'Degraded':
        return { 
          indicatorColor: 'bg-yellow-500', 
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700', 
          statusText: 'Degraded',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
        };
      case 'Outage':
        return { 
          indicatorColor: 'bg-red-500', 
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700', 
          statusText: 'Outage',
          icon: <XOctagon className="h-5 w-5 text-red-500" />
        };
      default:
        return { 
          indicatorColor: 'bg-gray-500', 
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700', 
          statusText: status,
          icon: <Info className="h-5 w-5 text-gray-500" />
        };
    }
  };
  
  // Get component icon
  const getComponentIcon = (iconType: string) => {
    switch (iconType) {
      case 'voice':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Cpu className="h-5 w-5 text-purple-500" />;
      case 'dashboard':
        return <Activity className="h-5 w-5 text-indigo-500" />;
      default:
        return <Server className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get incident status presentation
  const getIncidentStatusPresentation = (status: Incident['status']) => {
    switch (status) {
      case 'investigating':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          label: 'Investigating'
        };
      case 'identified':
        return {
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: <Info className="h-4 w-4 text-yellow-500" />,
          label: 'Identified'
        };
      case 'monitoring':
        return {
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <Clock className="h-4 w-4 text-blue-500" />,
          label: 'Monitoring'
        };
      case 'resolved':
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          label: 'Resolved'
        };
    }
  };
  
  // Get overall system status
  const getOverallSystemStatus = () => {
    if (statusList.some(component => component.status === 'Outage')) {
      return 'Major Outage';
    } else if (statusList.some(component => component.status === 'Degraded')) {
      return 'Partial Outage';
    } else if (statusList.every(component => component.status === 'Operational')) {
      return 'All Systems Operational';
    } else {
      return 'System Status Unknown';
    }
  };
  
  // Calculate overall uptime percentage
  const calculateOverallUptime = () => {
    if (statusList.length === 0) return 99.9; // Default
    
    const sum = statusList.reduce((acc, component) => 
      acc + (component.uptime_percentage || 0), 0);
    return (sum / statusList.length).toFixed(1);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header with system status summary */}
        <header className="h-20 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Status & Updates</h1>
              <p className="text-sm text-gray-500">Real-time system status and announcements</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={refreshAllData}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Badge variant="outline" className="text-xs flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Updated {formatDate(lastRefreshed.toISOString(), 'relative')}
            </Badge>
          </div>
        </header>

        {/* Main content with tabs */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Tabs defaultValue="status" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-white rounded-xl shadow-sm p-3 flex justify-between items-center">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="status" className="data-[state=active]:bg-white">
                  <Server className="h-4 w-4 mr-2" /> System Status
                </TabsTrigger>
                <TabsTrigger value="incidents" className="data-[state=active]:bg-white">
                  <AlertTriangle className="h-4 w-4 mr-2" /> Incidents
                </TabsTrigger>
                <TabsTrigger value="announcements" className="data-[state=active]:bg-white">
                  <MessageSquare className="h-4 w-4 mr-2" /> Announcements
                </TabsTrigger>
                <TabsTrigger value="metrics" className="data-[state=active]:bg-white">
                  <Activity className="h-4 w-4 mr-2" /> Metrics
                </TabsTrigger>
              </TabsList>
              
              {/* Time range selector - only visible for metrics tab */}
              {activeTab === 'metrics' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      {activeTimeframe === '24h' ? 'Last 24 Hours' : 
                       activeTimeframe === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                      <ChevronDown className="ml-2 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setActiveTimeframe('24h')}>Last 24 Hours</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTimeframe('7d')}>Last 7 Days</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTimeframe('30d')}>Last 30 Days</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* System Status Tab */}
            <TabsContent value="status" className="mt-6 space-y-6">
              {/* Overall System Status Card */}
              <Card className="shadow-sm border-0 overflow-hidden">
                <div className={`p-6 flex flex-col items-center justify-center ${statusList.every(c => c.status === 'Operational') ? 'bg-green-50' : statusList.some(c => c.status === 'Outage') ? 'bg-red-50' : 'bg-yellow-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {statusList.every(c => c.status === 'Operational') ? 
                      <CheckCircle className="h-8 w-8 text-green-500" /> : 
                      statusList.some(c => c.status === 'Outage') ? 
                      <XOctagon className="h-8 w-8 text-red-500" /> : 
                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    }
                    <h2 className="text-2xl font-bold text-gray-900">{getOverallSystemStatus()}</h2>
                  </div>
                  <p className="text-gray-600 mb-3">Current system uptime: {calculateOverallUptime()}%</p>
                  <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${statusList.every(c => c.status === 'Operational') ? 'bg-green-500' : statusList.some(c => c.status === 'Outage') ? 'bg-red-500' : 'bg-yellow-500'}`} 
                      style={{ width: `${calculateOverallUptime()}%` }}
                    ></div>
                  </div>
                </div>
                
                <CardContent className="p-0">
                  {loadingStatus ? (
                    <div className="p-8 flex justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
                        <p className="text-gray-500">Loading system status...</p>
                      </div>
                    </div>
                  ) : statusList.length === 0 ? (
                    <div className="p-8 flex justify-center">
                      <p className="text-gray-500">No system components found</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {statusList.map((component) => {
                        const { indicatorColor, bgColor, borderColor, textColor, statusText, icon } = getStatusPresentation(component.status);
                        return (
                          <div key={component.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${bgColor}`}>
                                  {getComponentIcon(component.icon || 'default')}
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{component.component_name}</h3>
                                  {component.message && (
                                    <p className="text-sm text-gray-600 mt-0.5">{component.message}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`inline-block h-2 w-2 rounded-full ${indicatorColor}`}></span>
                                    <span className={`text-sm font-medium ${textColor}`}>{statusText}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5 text-right">
                                    Updated {formatDate(component.last_updated, 'relative')}
                                  </p>
                                </div>
                                <div className="w-24">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Uptime</span>
                                    <span className="font-medium">{component.uptime_percentage}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-gray-200 rounded-full">
                                    <div 
                                      className={`h-1.5 rounded-full ${component.status === 'Operational' ? 'bg-green-500' : component.status === 'Degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                      style={{ width: `${component.uptime_percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Incidents Tab */}
            <TabsContent value="incidents" className="mt-6 space-y-6">
              <Card className="shadow-sm border-0 overflow-hidden">
                <CardHeader className="border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <CardTitle>System Incidents</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Bell className="mr-1.5 h-3.5 w-3.5" /> Subscribe
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingIncidents ? (
                    <div className="p-8 flex justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
                        <p className="text-gray-500">Loading incidents...</p>
                      </div>
                    </div>
                  ) : incidents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No Incidents</h3>
                      <p className="text-gray-500 text-sm mt-1">All systems are operating normally</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {incidents.map((incident) => {
                        const statusInfo = getIncidentStatusPresentation(incident.status);
                        return (
                          <div key={incident.id} className="p-5 hover:bg-gray-50 transition-colors">
                            <div className="flex gap-3">
                              <div className={`mt-0.5 p-1.5 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                                {statusInfo.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium text-gray-900">{incident.title}</h3>
                                  <Badge 
                                    variant="outline" 
                                    className={`${statusInfo.color} ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                                  >
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1.5">{incident.description}</p>
                                
                                <div className="mt-3 text-xs text-gray-500 flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> 
                                    Started {formatDate(incident.created_at, 'full')}
                                  </span>
                                  {incident.status === 'resolved' && incident.resolved_at && (
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3 text-green-500" /> 
                                      Resolved {formatDate(incident.resolved_at, 'relative')}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Affected components */}
                                <div className="mt-3">
                                  <span className="text-xs text-gray-500">Affected components: </span>
                                  <div className="flex gap-1.5 mt-1.5">
                                    {incident.affected_components.map(compId => {
                                      const component = statusList.find(c => c.id === compId);
                                      return component ? (
                                        <Badge key={compId} variant="secondary" className="text-xs">
                                          {component.component_name}
                                        </Badge>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Announcements Tab */}
            <TabsContent value="announcements" className="mt-6 space-y-6">
              <Card className="shadow-sm border-0 overflow-hidden">
                <CardHeader className="border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <CardTitle>System Announcements</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingAnnouncements ? (
                    <div className="p-8 flex justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
                        <p className="text-gray-500">Loading announcements...</p>
                      </div>
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No Announcements</h3>
                      <p className="text-gray-500 text-sm mt-1">There are no recent announcements</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="hover:bg-gray-50 transition-colors">
                          <div className="p-5">
                            <div 
                              className="flex justify-between items-start cursor-pointer" 
                              onClick={() => toggleAnnouncementExpand(announcement.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${announcement.priority === 'high' ? 'bg-red-50' : announcement.priority === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'}`}>
                                  <MessageSquare className={`h-4 w-4 ${announcement.priority === 'high' ? 'text-red-500' : announcement.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                                    {!announcement.read && (
                                      <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">New</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <Badge variant="outline" className="text-xs font-normal">
                                      {announcement.category}
                                    </Badge>
                                    <span>Posted {formatDate(announcement.created_at, 'relative')}</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="p-0 h-6 w-6 rounded-full">
                                {expandedAnnouncement === announcement.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            
                            {expandedAnnouncement === announcement.id && (
                              <div className="mt-3 pl-10 pr-4 animate-in fade-in duration-200">
                                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                                  {announcement.content}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Metrics Tab */}
            <TabsContent value="metrics" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingMetrics ? (
                  Array(4).fill(0).map((_, index) => (
                    <Card key={index} className="shadow-sm border-0 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <Skeleton className="h-5 w-40" />
                        </div>
                        <div className="mt-4">
                          <Skeleton className="h-10 w-20" />
                        </div>
                        <div className="mt-4">
                          <Skeleton className="h-24 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : systemMetrics.length === 0 ? (
                  <div className="col-span-2 flex justify-center py-12">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No Metrics Available</h3>
                      <p className="text-gray-500 text-sm mt-1">System metrics information is not available</p>
                    </div>
                  </div>
                ) : (
                  systemMetrics.map((metric) => (
                    <Card key={metric.id} className="shadow-sm border-0 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{metric.name}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Last updated {formatDate(metric.timestamp, 'time')}</p>
                          </div>
                          <Badge 
                            className={`${metric.status === 'good' ? 'bg-green-100 text-green-800' : metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {metric.status === 'good' ? 'Healthy' : metric.status === 'warning' ? 'Warning' : 'Critical'}
                          </Badge>
                        </div>
                        <div className="mt-6">
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold">{metric.value}</span>
                            <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Min</span>
                              <span>Current</span>
                              <span>Max</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full relative">
                              <div 
                                className={`absolute h-2 rounded-full ${metric.status === 'good' ? 'bg-green-500' : metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${metric.value / (metric.name.includes('Usage') ? 100 : 150) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default StatusUpdates;
