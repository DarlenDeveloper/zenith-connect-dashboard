import { useState, useEffect } from "react";
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
  const { agents, selectedAgent, setSelectedAgentId, loadingAgents } = useAgent();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);

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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden font-['Inter', sans-serif] m-0 p-0">
        <Sidebar
          className="bg-black-bean-950 border-r border-black-bean-900 w-[220px] text-gray-300 flex-shrink-0"
          collapsible="none"
        >
          <SidebarHeader className="h-14 flex items-center px-4 border-b border-black-bean-900">
            <Link to="/dashboard" className="flex items-center">
              <ZenithLogo className="text-white" />
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
                    className={`h-10 text-sm px-3 rounded-md mx-2 ${
                      item.active 
                        ? 'bg-black-bean-600 text-white font-semibold'
                        : 'text-gray-300 hover:bg-black-bean-900 hover:text-white'
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
          
          <SidebarFooter className="mt-auto border-t border-black-bean-900 py-4 px-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-black-bean-800 text-gray-200">
                    {profileName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <p className="text-gray-100 font-medium">{profileName || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-gray-400">{profileEmail || 'loading...'}</p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-black-bean-900 h-9 text-sm px-3"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2.5" />
              <span className="text-sm">Log out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-y-auto w-full bg-gray-50 p-0 m-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-white px-4 lg:px-6 shadow-sm">
            {isMobile && <SidebarTrigger className="text-muted-foreground" />}
            <div className="ml-auto flex items-center gap-3">
              <Select 
                value={selectedAgent?.id || ""} 
                onValueChange={(value) => setSelectedAgentId(value || null)}
                disabled={loadingAgents || agents.length === 0}
              >
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <div className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-gray-500" /><SelectValue placeholder={loadingAgents ? "Loading agents..." : "Select Agent"} /></div>
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.agent_ref_id})
                    </SelectItem>
                  ))}
                  {agents.length === 0 && !loadingAgents && (
                    <div className="px-2 py-1.5 text-sm text-gray-500">(No active agents)</div>
                  )}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-black-bean-600 text-white">
                  {profileName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          
          <div className="flex-1 w-full p-0 m-0">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
