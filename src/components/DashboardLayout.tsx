import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, MessageSquare, CreditCard, 
  Settings, LogOut, InboxIcon, Menu, 
  PhoneCall, BarChart2, PlusCircle, MicIcon,
  FileText, Headphones, Bell, Calendar, Users, 
  Activity, AlertTriangle, UserCheck, Lightbulb, BellRing
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ZenithLogo from "@/components/ZenithLogo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import UserPasswordDialog from "@/components/UserPasswordDialog";
import { toast } from "sonner";
import { notifyInfo } from "@/utils/notification";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  active?: boolean;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const { users, selectedUser, setSelectedUserId, loadingUsers, authenticateUser, authenticatedUserIds } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // User authentication states
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else if (data) {
            setProfileName(data.name);
            setProfileEmail(user.email || null);
          }
        } catch (err) {
          console.error('Error in fetchProfile:', err);
        }
      } else {
        setProfileName(null);
        setProfileEmail(null);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error("Error fetching unread notification count:", error);
        setUnreadCount(0);
      } else {
        setUnreadCount(count ?? 0);
      }
    };

    fetchUnreadCount();

    const notificationChannel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
          (payload) => {
            console.log('Notification change detected, re-checking unread count...', payload);
            fetchUnreadCount(); 
          }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };

  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} />, active: location.pathname === "/dashboard" },
    { name: "Call History", path: "/call-history", icon: <PhoneCall size={18} />, active: location.pathname === "/call-history" },
    { name: "Analytics", path: "/analytics", icon: <BarChart2 size={18} />, active: location.pathname === "/analytics" },
    { name: "Technical", path: "/technical", icon: <AlertTriangle size={18} />, active: location.pathname === "/technical" },
    { name: "Feature Requests", path: "/feature-requests", icon: <Lightbulb size={18} />, active: location.pathname === "/feature-requests" },
    { name: "Status & Updates", path: "/status-updates", icon: <Bell size={18} />, active: location.pathname === "/status-updates" },
    { name: "Users", path: "/users", icon: <Users size={18} />, active: location.pathname === "/users" },
    { name: "Activity", path: "/activity", icon: <Activity size={18} />, active: location.pathname === "/activity" },
    { name: "Subscription", path: "/subscription", icon: <CreditCard size={18} />, active: location.pathname === "/subscription" },
    { name: "Settings", path: "/settings", icon: <Settings size={18} />, active: location.pathname === "/settings" },
  ];

  const formatCount = (count: number): string => {
    if (count === 0) return "";
    if (count > 99) return "99+";
    return count.toString();
  };

  const handleUserChange = (userId: string | null) => {
    if (!userId) {
      setSelectedUserId(null);
      return;
    }
    
    // Check if user is already authenticated
    if (authenticatedUserIds.includes(userId)) {
      setSelectedUserId(userId);
      toast.success(`User ${users.find(u => u.id === userId)?.name} is now active`);
    } else {
      // Open password dialog for authentication
      setPendingUserId(userId);
      setIsPasswordDialogOpen(true);
    }
  };

  const handleUserPasswordVerification = (success: boolean) => {
    if (success && pendingUserId) {
      setSelectedUserId(pendingUserId);
      const user = users.find(u => u.id === pendingUserId);
      toast.success(`User ${user?.name} authenticated successfully`);
    }
    
    // Clear pending user if verification failed
    if (!success) {
      setPendingUserId(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden font-['Inter', sans-serif] m-0 p-0 max-w-[100vw] relative bg-white">
        <Sidebar
          className="bg-[#1f2937] w-[200px] sm:w-[220px] md:w-[220px] lg:w-[240px] text-white flex-shrink-0 shadow-md transition-all duration-300 ease-in-out h-screen"
          collapsible="offcanvas"
        >
          <SidebarHeader className="h-14 flex items-center px-3 sm:px-4 border-b-0">
            <Link to="/dashboard" className="flex items-center w-full">
              <span className="text-white font-bold text-base sm:text-lg md:text-xl truncate">AIRIES</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="flex flex-col flex-grow overflow-y-auto">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.active}
                    tooltip={item.name}
                    className={`h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-3 rounded-md mx-0 my-0.5 transition-all duration-200 ${
                      item.active ? "bg-[#34445c] text-white" : "text-gray-300 hover:bg-[#2c3038] hover:text-white"
                    }`}
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="h-12 sm:h-14 px-2 sm:px-3 flex items-center justify-center border-t-0 mt-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white w-full justify-start px-2 h-8 sm:h-9 text-xs sm:text-sm"
              onClick={handleLogout}
            >
              <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span>Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-grow overflow-hidden">
          <header className="h-14 border-b border-[#e2e8f0] bg-white flex items-center justify-between px-2 sm:px-4 md:px-6 flex-shrink-0 overflow-hidden">
            <div className="flex items-center">
              <SidebarTrigger className="lg:hidden mr-2">
                <Menu size={20} />
              </SidebarTrigger>
              <div className="flex-grow flex items-center">
                {selectedUser && (
                  <div className="hidden sm:flex items-center gap-1 bg-green-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm text-green-700 font-medium border border-green-200 whitespace-nowrap">
                    <UserCheck size={14} className="text-green-600 hidden xs:inline" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}: {selectedUser.name}</span>
                  </div>
                )}
                {!selectedUser && (
                  <div className="hidden sm:flex items-center gap-1 bg-amber-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm text-amber-700 font-medium border border-amber-200 whitespace-nowrap">
                    <AlertTriangle size={14} className="text-amber-600 hidden xs:inline" />
                    <span>No User Selected</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {users && users.length > 0 && (
                <div className="relative">
                  <Select value={selectedUser?.id || ""} onValueChange={handleUserChange}>
                    <SelectTrigger className="w-[100px] xs:w-[120px] sm:w-[150px] md:w-[180px] text-xs sm:text-sm h-8 sm:h-9">
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingUsers ? (
                        <SelectItem value="loading" disabled>Loading users...</SelectItem>
                      ) : (
                        <>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <span>{user.name}</span>
                                {authenticatedUserIds.includes(user.id) && (
                                  <span className="bg-green-100 text-green-700 text-xs py-0.5 px-1.5 rounded-full">
                                    Auth
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-1 sm:gap-2">
                <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost" className="relative">
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                          {formatCount(unreadCount)}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-[280px] sm:w-[320px] md:w-[380px] p-0">
                    <NotificationsDropdown 
                      onClose={() => setIsNotificationOpen(false)}
                      onReadAll={() => setUnreadCount(0)}
                    />
                  </PopoverContent>
                </Popover>

                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${profileName || "User"}&background=1d4fd8&color=fff`} />
                  <AvatarFallback>
                    {profileName ? profileName?.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-xs sm:text-sm font-medium truncate max-w-[80px] md:max-w-[120px] lg:max-w-none">{profileName || "User"}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[80px] md:max-w-[120px] lg:max-w-none">{profileEmail || ""}</p>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-grow overflow-auto bg-white w-full">
            {children}
          </main>
        </div>
        
        {/* User Authentication Dialog */}
        {pendingUserId && (
          <UserPasswordDialog
            isOpen={isPasswordDialogOpen}
            onClose={() => {
              setIsPasswordDialogOpen(false);
              setPendingUserId(null);
            }}
            user={users.find(u => u.id === pendingUserId) || null}
            onVerify={handleUserPasswordVerification}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
