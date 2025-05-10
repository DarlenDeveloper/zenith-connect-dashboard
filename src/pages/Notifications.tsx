import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Users, Bot, MessageSquare, Info, Settings, BellRing } from "lucide-react";
import { toast } from "sonner";
import { notifySuccess } from "@/utils/notification";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "conversation" | "system" | "team" | "ai";
}

const Notifications = () => {
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
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case "system":
        return <Info className="h-5 w-5 text-gray-700" />;
      case "team":
        return <Users className="h-5 w-5 text-blue-600" />;
      case "ai":
        return <Bot className="h-5 w-5 text-blue-800" />;
      default:
        return <Bell className="h-5 w-5 text-gray-700" />;
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
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-none";
      case "system":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-none";
      case "team":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-none";
      case "ai":
        return "bg-blue-200 text-blue-900 hover:bg-blue-300 border-none";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-none";
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
    notifySuccess("All notifications marked as read");
  };

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : activeTab === "unread" 
      ? notifications.filter(n => !n.read) 
      : notifications.filter(n => n.type === activeTab);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Count by type
  const conversationCount = notifications.filter(n => n.type === "conversation").length;
  const systemCount = notifications.filter(n => n.type === "system").length;
  const teamCount = notifications.filter(n => n.type === "team").length;
  const aiCount = notifications.filter(n => n.type === "ai").length;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <header className="h-16 shrink-0 bg-white flex items-center px-6 justify-between border-b border-gray-100 shadow-sm">
          <div className="flex items-center">
            <BellRing className="mr-2 h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <Button 
              size="sm" 
              onClick={markAllAsRead}
              className="flex items-center bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Unread</p>
                  <p className="text-3xl font-bold">{unreadCount}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Bell className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium mb-1">Conversations</p>
                  <p className="text-3xl font-bold">{conversationCount}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">System</p>
                  <p className="text-3xl font-bold">{systemCount}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Info className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">AI Notifications</p>
                  <p className="text-3xl font-bold">{aiCount}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Bot className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <Card className="bg-white rounded-xl shadow-md overflow-hidden border-none">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Notification Center</CardTitle>
                  <CardDescription>
                    View and manage all your notifications
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1 text-gray-600">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 mb-6 bg-gray-100">
                  <TabsTrigger value="all" className="relative data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    All
                    {unreadCount > 0 && (
                      <Badge className="ml-1 bg-blue-600 absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="conversation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Conversations</TabsTrigger>
                  <TabsTrigger value="ai" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">AI</TabsTrigger>
                  <TabsTrigger value="team" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Team</TabsTrigger>
                  <TabsTrigger value="system" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">System</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="space-y-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                      <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                        <Bell className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        You'll see your {activeTab === "all" ? "notifications" : activeTab + " notifications"} here when you have some
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`
                          p-5 rounded-lg border border-gray-100 mb-3 transition-colors shadow-sm
                          ${notification.read ? "bg-white" : "bg-blue-50 border-blue-100"}
                        `}
                      >
                        <div className="flex">
                          <div className="mr-4 mt-0.5">
                            <div className={`p-2 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                              {getIcon(notification.type)}
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">{notification.title}</p>
                              <Badge 
                                variant="outline"
                                className={`text-xs ${getTypeColor(notification.type)}`}
                              >
                                {getTypeLabel(notification.type)}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm">{notification.message}</p>
                            <div className="flex items-center justify-between pt-1">
                              <p className="text-xs text-gray-500">{notification.time}</p>
                              {!notification.read && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
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
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
