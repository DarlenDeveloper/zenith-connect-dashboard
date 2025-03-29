
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Users, Bot, MessageSquare, Info, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "conversation" | "system" | "team" | "ai";
}

const Notifications = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  
  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New conversation started",
      message: "Sarah Johnson has started a new conversation regarding billing issues.",
      time: "10 minutes ago",
      read: false,
      type: "conversation"
    },
    {
      id: "2",
      title: "System maintenance scheduled",
      message: "Zenith Portal will be down for maintenance on Sunday, June 5th from 2:00 AM to 4:00 AM EST.",
      time: "2 hours ago",
      read: false,
      type: "system"
    },
    {
      id: "3",
      title: "Team member invitation accepted",
      message: "David Miller has accepted your invitation to join your organization.",
      time: "Yesterday",
      read: true,
      type: "team"
    },
    {
      id: "4",
      title: "AI assistant performance report",
      message: "Your monthly AI performance report is ready. Resolution rate has improved by 12%.",
      time: "2 days ago",
      read: true,
      type: "ai"
    },
    {
      id: "5",
      title: "High priority conversation",
      message: "A conversation has been flagged as high priority. Customer: Robert Chen.",
      time: "3 days ago",
      read: true,
      type: "conversation"
    },
    {
      id: "6",
      title: "New AI model available",
      message: "A new AI model is available for your customer support agents. Enable it in settings.",
      time: "1 week ago",
      read: true,
      type: "ai"
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "conversation":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "system":
        return <Info className="h-5 w-5 text-amber-500" />;
      case "team":
        return <Users className="h-5 w-5 text-green-500" />;
      case "ai":
        return <Bot className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "conversation":
        return "Conversation";
      case "system":
        return "System";
      case "team":
        return "Team";
      case "ai":
        return "AI Assistant";
      default:
        return "General";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "conversation":
        return "bg-blue-100 text-blue-800";
      case "system":
        return "bg-amber-100 text-amber-800";
      case "team":
        return "bg-green-100 text-green-800";
      case "ai":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "You have cleared all unread notifications",
    });
  };

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : activeTab === "unread" 
      ? notifications.filter(n => !n.read) 
      : notifications.filter(n => n.type === activeTab);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your organization's activity
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            className="ml-auto"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                You have {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all" className="relative">
                All
                {unreadCount > 0 && (
                  <Badge className="ml-1 bg-primary absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="conversation">Conversations</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No notifications</h3>
                  <p className="text-muted-foreground">
                    You'll see your {activeTab === "all" ? "notifications" : activeTab + " notifications"} here when you have some
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`
                      p-4 rounded-lg border mb-3 transition-colors
                      ${notification.read ? "bg-card" : "bg-blue-50/50 dark:bg-blue-900/10"}
                    `}
                  >
                    <div className="flex">
                      <div className="mr-4 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{notification.title}</p>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${getTypeColor(notification.type)}`}
                          >
                            {getTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{notification.message}</p>
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Notifications;
