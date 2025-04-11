import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from 'date-fns';
import { BellRing, CheckCheck } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  target_table: string | null;
  target_id: string | null;
  created_at: string;
}

interface NotificationsDropdownProps {
  onClose: () => void; // Function to close the popover
  onReadAll: () => void; // Function to update the bell icon immediately
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose, onReadAll }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20); // Limit the number initially fetched

      if (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Optional: Add real-time subscription if needed for instant updates in the dropdown
    // This might duplicate the subscription in DashboardLayout, consider consolidating

  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user || notifications.filter(n => !n.is_read).length === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false); // Only update unread ones

      if (error) throw error;
      
      // Update local state immediately
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      onReadAll(); // Update the indicator in the layout
      toast.success("Marked all as read");

    } catch (err: any) {
      console.error("Error marking all as read:", err);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // TODO: Implement navigation based on notification type/target
    console.log("Notification clicked:", notification);

    // Mark as read if not already
    if (!notification.is_read) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);
          
        if (error) throw error;
        // Update local state
        setNotifications(prev => prev.map(n => 
            n.id === notification.id ? { ...n, is_read: true } : n
        ));
        // Note: We don't call onReadAll here as the indicator might still be needed if others are unread
      } catch (err: any) {
         console.error("Error marking notification as read:", err);
         // Optionally show toast
      }
    }
    onClose(); // Close the dropdown after clicking
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Card className="border-none shadow-none rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
        <CardTitle className="text-lg font-medium">Notifications</CardTitle>
        {unreadCount > 0 && (
           <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleMarkAllRead}>
             <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
           </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-4">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">No notifications yet.</p>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 hover:bg-muted/50 cursor-pointer ${notification.is_read ? 'opacity-70' : 'font-medium'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm truncate">{notification.title}</p>
                    {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 ml-2 flex-shrink-0"></span>
                    )}
                  </div>
                  {notification.message && (
                     <p className="text-xs text-muted-foreground mb-1 truncate">{notification.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      {/* Optional Footer */}
      {/* <CardFooter className="py-2 px-4 border-t">
        <Button variant="link" size="sm" className="w-full">View all notifications</Button>
      </CardFooter> */}
    </Card>
  );
};

export default NotificationsDropdown; 