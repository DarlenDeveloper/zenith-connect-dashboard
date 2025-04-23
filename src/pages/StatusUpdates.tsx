import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bell, CheckCircle, AlertTriangle as WarningIcon, XOctagon as OutageIcon, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Interface for System Status
interface SystemComponentStatus {
  id: string;
  component_name: string;
  status: string; // Operational, Degraded, Outage
  message: string | null;
  last_updated: string;
}

// Interface for Announcements
interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string; // Or published_at if preferred
}

const StatusUpdates = () => {
  const { user } = useAuth();
  const [statusList, setStatusList] = useState<SystemComponentStatus[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Fetch System Status
  const fetchSystemStatus = async () => {
    setLoadingStatus(true);
    try {
      const { data, error } = await supabase
        .from('system_status')
        .select('*')
        .order('component_name', { ascending: true });
      
      if (error) throw error;
      setStatusList(data || []);
    } catch (error: any) {
      toast.error(`Failed to load system status: ${error.message}`);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Fetch Announcements
  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error: any) {
      toast.error(`Failed to load announcements: ${error.message}`);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!user) return;
    fetchSystemStatus();
    fetchAnnouncements();

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

    return () => {
      supabase.removeChannel(statusSubscription);
      supabase.removeChannel(announcementSubscription);
    };
  }, [user]);

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    } catch (e) { return 'Invalid Date'; }
  };

  // Helper to get status presentation (dot color and text color)
  const getStatusPresentation = (status: string) => {
    switch (status) {
      case 'Operational':
        return { indicatorColor: 'bg-green-500', textColor: 'text-green-700', statusText: 'Operational' };
      case 'Degraded':
        return { indicatorColor: 'bg-yellow-500', textColor: 'text-yellow-700', statusText: 'Degraded Performance' };
      case 'Outage':
        return { indicatorColor: 'bg-red-500', textColor: 'text-red-700', statusText: 'Outage' };
      default:
        return { indicatorColor: 'bg-gray-500', textColor: 'text-gray-700', statusText: status }; // Handle unknown statuses
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <div className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-gray-500" />
            <h1 className="text-xl font-medium">Status & Updates</h1>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6 space-y-6">
          {/* System Status Card - Redesigned List */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Current System Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStatus ? (
                <p>Loading system status...</p>
              ) : statusList.length === 0 ? (
                 <p className="text-sm text-gray-500">(System status information unavailable)</p>
              ) : (
                // Use a simple list, removing old background colors
                <div className="space-y-4">
                  {statusList.map((component) => {
                    const { indicatorColor, textColor, statusText } = getStatusPresentation(component.status);
                    return (
                      <div key={component.id} className="flex items-start border-b pb-3 last:border-b-0 last:pb-0">
                        {/* Status Indicator Dot */}
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${indicatorColor} flex-shrink-0 mr-3`}></span>
                        <div className="flex-grow">
                          {/* Component Name and Status Text */}
                          <div className="flex justify-between items-baseline mb-0.5">
                            <p className="font-medium text-gray-800">{component.component_name}</p>
                            <p className={`text-sm font-medium ${textColor}`}>{statusText}</p>
                          </div>
                          {/* Optional Message */}
                          {component.message && (
                            <p className="text-sm text-gray-600 mt-1">{component.message}</p>
                          )}
                          {/* Last Updated Timestamp */}
                          <p className="text-xs text-gray-400 mt-1">(Last Updated: {formatDate(component.last_updated)})</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Announcements Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAnnouncements ? (
                <p>Loading announcements...</p>
              ) : announcements.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent announcements.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="border-b pb-4 last:border-b-0"><h3 className="font-semibold mb-1">{ann.title}</h3><p className="text-sm text-gray-700 whitespace-pre-wrap">{ann.content}</p><p className="text-xs text-gray-500 mt-2">Posted: {formatDate(ann.created_at)}</p></div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default StatusUpdates;
