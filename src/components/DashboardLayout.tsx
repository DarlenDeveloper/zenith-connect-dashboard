
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Menu, X, ChevronDown, Users, 
  MessageSquare, BarChart3, CreditCard, ShoppingBag, 
  LogOut, User, Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  active?: boolean;
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
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} />, active: location.pathname === "/dashboard" },
    { name: "Products", path: "/products", icon: <ShoppingBag size={20} />, active: location.pathname === "/products" },
    { name: "New RFQ", path: "/new-rfq", icon: <ShoppingBag size={20} />, active: location.pathname === "/new-rfq" },
    { name: "Productions", path: "/productions", icon: <ShoppingBag size={20} />, active: location.pathname === "/productions" },
    { name: "Analytics", path: "/analytics", icon: <BarChart3 size={20} />, active: location.pathname === "/analytics" },
    { name: "Message", path: "/messages", icon: <MessageSquare size={20} />, active: location.pathname === "/messages" },
    { name: "Payment", path: "/payment", icon: <CreditCard size={20} />, active: location.pathname === "/payment" },
    { name: "POS", path: "/pos", icon: <ShoppingBag size={20} />, active: location.pathname === "/pos" },
    { name: "Profile", path: "/profile", icon: <User size={20} />, active: location.pathname === "/profile" },
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
          w-56 shrink-0 border-r border-sidebar-border bg-sidebar
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full text-sidebar-foreground">
          {/* Sidebar header */}
          <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center">
              <div className="font-bold text-2xl text-neon-green ml-1">made.</div>
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

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  ${item.active 
                    ? "bg-sidebar-accent text-neon-green" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
              >
                <span className={`${item.active ? "text-neon-green" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-16 shrink-0 border-b border-border bg-white flex items-center px-6">
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
          
          <h1 className="text-xl font-medium">{navItems.find(item => item.active)?.name || "Dashboard"}</h1>
          
          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <User size={16} className="mr-2" />
              {user?.name}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
