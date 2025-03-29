
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Bell, Settings, LogOut, 
  Menu, X, ChevronDown, Users, MessageSquare,
  BarChart3, Bot, HelpCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import ZenithLogo from "./ZenithLogo";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Conversations", path: "/conversations", icon: <MessageSquare size={20} /> },
    { name: "AI Assistants", path: "/assistants", icon: <Bot size={20} /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart3 size={20} /> },
    { name: "Team", path: "/team", icon: <Users size={20} /> },
    { name: "Notifications", path: "/notifications", icon: <Bell size={20} />, badge: "3" },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
    { name: "Help & Support", path: "/support", icon: <HelpCircle size={20} /> },
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ZU";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 lg:static lg:z-auto
          w-64 shrink-0 border-r border-border bg-sidebar
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full text-sidebar-foreground">
          {/* Sidebar header */}
          <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center">
              <ZenithLogo className="h-8 w-auto text-white" />
            </Link>
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(false)}
                className="ml-auto lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X size={20} />
              </Button>
            )}
          </div>

          {/* Organization name */}
          <div className="px-4 py-3">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{user?.organizationName}</span>
              <Badge variant="outline" className="bg-sidebar-accent text-xs font-normal">
                Free Plan
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto no-scrollbar px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-md text-sm
                    ${isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge className="bg-zenith-700 hover:bg-zenith-800">{item.badge}</Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2 text-sidebar-foreground hover:bg-sidebar-accent">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8 bg-sidebar-primary text-sidebar-primary-foreground">
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs opacity-70 truncate max-w-[140px]">{user?.email}</span>
                    </div>
                  </div>
                  <ChevronDown size={16} className="ml-auto opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                  <LogOut size={16} className="mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-16 shrink-0 border-b border-border bg-card flex items-center px-4">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
              className="mr-4 lg:hidden"
            >
              <Menu size={20} />
            </Button>
          )}
          
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/notifications")}
              className="relative"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            {!isMobile && (
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </Button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
