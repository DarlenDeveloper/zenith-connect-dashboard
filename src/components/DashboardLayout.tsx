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
          className="bg-[#1f2937] border-r border-[#2c3038] w-[220px] md:w-[220px] text-white flex-shrink-0"
          collapsible="sm"
          collapsedWidth="0"
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
          
          <SidebarFooter className="h-14 px-3 flex items-center justify-center border-t border-[#2c3038] mt-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white w-full justify-start px-2"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-grow overflow-hidden">
          <header className="h-14 border-b border-[#e2e8f0] bg-white flex items-center justify-between px-4 md:px-6 flex-shrink-0">
            <div className="flex items-center">
              <SidebarTrigger className="lg:hidden mr-2">
                <Menu size={20} />
              </SidebarTrigger>
              <div className="flex-grow flex items-center">
                {selectedAgent && (
                  <div className="hidden md:flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
                    <UserCheck size={14} />
                    <span>{selectedAgent.name} • Active</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {agents && agents.length > 0 && (
                <div className="relative hidden sm:block">
                  <Select value={selectedAgent?.id || null} onValueChange={handleAgentChange}>
                    <SelectTrigger className="w-[180px] text-sm">
                      <SelectValue placeholder="Select Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingAgents ? (
                        <div className="py-2 px-2 text-center">
                          <span className="loading loading-spinner loading-xs"></span>
                        </div>
                      ) : agents.length > 0 ? (
                        agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} {authenticatedAgentIds.includes(agent.id) && "✓"}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="py-2 px-2 text-sm">No agents found</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                <PopoverContent align="end" className="w-[380px] p-0">
                  <NotificationsDropdown 
                    onClose={() => setIsNotificationOpen(false)} 
                  />
                </PopoverContent>
              </Popover>

              <div className="border-l border-[#e2e8f0] h-8 mx-2 hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${profileName || "User"}&background=1d4fd8&color=fff`} />
                  <AvatarFallback>
                    {profileName ? profileName?.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{profileName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{profileEmail || ""}</p>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-grow overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
        
        <AgentPasswordDialog 
          isOpen={isPasswordDialogOpen} 
          onClose={() => setIsPasswordDialogOpen(false)}
          agentId={pendingAgentId}
          onVerified={handleAgentPasswordVerification}
        />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
