import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, MessageSquare, CreditCard, 
  Settings, LogOut, InboxIcon, Menu, 
  PhoneCall, BarChart2, PlusCircle, MicIcon,
  FileText, Headphones, Bell, Calendar, Users, 
  Activity, AlertTriangle, UserCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAgent } from "@/contexts/AgentContext";
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
import AgentPasswordDialog from "@/components/AgentPasswordDialog";
import { toast } from "sonner";

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
  const { agents, selectedAgent, setSelectedAgentId, loadingAgents, authenticateAgent, authenticatedAgentIds } = useAgent();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Agent authentication states
  const [pendingAgentId, setPendingAgentId] = useState<string | null>(null);
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
    { name: "AI Voice", path: "/ai-voice-settings", icon: <MicIcon size={18} />, active: location.pathname === "/ai-voice-settings" },
    { name: "Status & Updates", path: "/status-updates", icon: <Bell size={18} />, active: location.pathname === "/status-updates" },
    { name: "Agents", path: "/agents", icon: <Users size={18} />, active: location.pathname === "/agents" },
    { name: "Activity", path: "/activity", icon: <Activity size={18} />, active: location.pathname === "/activity" },
    { name: "Subscription", path: "/subscription", icon: <CreditCard size={18} />, active: location.pathname === "/subscription" },
    { name: "Settings", path: "/settings", icon: <Settings size={18} />, active: location.pathname === "/settings" },
  ];

  const formatCount = (count: number): string => {
    if (count === 0) return "";
    if (count > 99) return "99+";
    return count.toString();
  };

  const handleAgentChange = (agentId: string | null) => {
    if (!agentId) {
      setSelectedAgentId(null);
      return;
    }
    
    // Check if agent is already authenticated
    if (authenticatedAgentIds.includes(agentId)) {
      setSelectedAgentId(agentId);
      toast.success(`Agent ${agents.find(a => a.id === agentId)?.name} is now active`);
    } else {
      // Open password dialog for authentication
      setPendingAgentId(agentId);
      setIsPasswordDialogOpen(true);
    }
  };

  const handleAgentPasswordVerification = (success: boolean) => {
    if (success && pendingAgentId) {
      setSelectedAgentId(pendingAgentId);
      const agent = agents.find(a => a.id === pendingAgentId);
      toast.success(`Agent ${agent?.name} authenticated successfully`);
    }
    
    // Clear pending agent if verification failed
    if (!success) {
      setPendingAgentId(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden font-['Inter', sans-serif] m-0 p-0">
        <Sidebar
          className="bg-[#1b1f24] border-r border-[#2c3038] w-[220px] text-white flex-shrink-0"
          collapsible="none"
        >
          <SidebarHeader className="h-14 flex items-center px-4 border-b border-[#2c3038]">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-white font-bold text-xl">AIRIES</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="py-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.active}
                    tooltip={item.name}
                    className={`h-10 text-sm px-3 rounded-none mx-0 ${
                      item.active 
                        ? 'bg-[#1a56db] text-white font-medium'
                        : 'text-white hover:bg-[#32363c] hover:text-white'
                    }`}
                  >
                    <Link to={item.path} className="flex items-center gap-2.5">
                      <span className="flex-shrink-0 w-[18px]">{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="mt-auto border-t border-[#2c3038] py-4 px-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#1a56db] text-white">
                    {profileName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <p className="text-white font-medium">{profileName || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-gray-400">{profileEmail || 'loading...'}</p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:text-white hover:bg-[#32363c] h-9 text-sm px-3"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2.5" />
              <span className="text-sm">Log out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-y-auto w-full bg-gray-50 p-0 m-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6 shadow-sm mt-2">
            {isMobile && <SidebarTrigger className="text-muted-foreground" />}
            <div className="ml-auto flex items-center gap-3">
              <Select 
                value={selectedAgent?.id || ""} 
                onValueChange={handleAgentChange}
                disabled={loadingAgents || agents.length === 0}
              >
                <SelectTrigger className="w-[180px] h-9 text-sm border-gray-200">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder={loadingAgents ? "Loading agents..." : "Select Agent"} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem 
                      key={agent.id} 
                      value={agent.id}
                      className={authenticatedAgentIds.includes(agent.id) ? "text-[#1a56db] font-medium" : ""}
                    >
                      {agent.name} ({agent.agent_ref_id})
                      {authenticatedAgentIds.includes(agent.id) && " ✓"}
                    </SelectItem>
                  ))}
                  {agents.length === 0 && !loadingAgents && (
                    <div className="px-2 py-1.5 text-sm text-gray-500">(No active agents)</div>
                  )}
                </SelectContent>
              </Select>
              <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full text-muted-foreground hover:text-foreground relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1a56db] text-[10px] font-medium text-white">
                        {formatCount(unreadCount)}
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <NotificationsDropdown 
                    onClose={() => setIsNotificationOpen(false)} 
                    onReadAll={() => setUnreadCount(0)}
                  /> 
                </PopoverContent>
              </Popover>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#1a56db] text-white">
                  {profileName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          
          <div className="flex-1 flex flex-col w-full mx-auto pb-16" style={{ maxWidth: "1920px" }}>
            {children}
          </div>
          
          <footer className="fixed bottom-0 left-0 right-0 ml-[220px] p-4 text-center text-sm text-gray-500 bg-white border-t shadow-sm z-10">
            Powered By Najod
          </footer>
        </div>
      </div>
      
      {/* Agent Password Dialog */}
      <AgentPasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        agent={agents.find(a => a.id === pendingAgentId) || null}
        onVerify={handleAgentPasswordVerification}
      />
    </SidebarProvider>
  );
};

export default DashboardLayout;
