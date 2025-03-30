
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, MessageSquare, CreditCard, User, 
  Settings, LogOut, InboxIcon, Menu
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ZenithLogo from "@/components/ZenithLogo";

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} />, active: location.pathname === "/dashboard" },
    { name: "Conversations", path: "/conversations", icon: <MessageSquare size={20} />, active: location.pathname === "/conversations" },
    { name: "Subscription", path: "/subscription", icon: <CreditCard size={20} />, active: location.pathname === "/subscription" },
    { name: "Profile", path: "/profile", icon: <User size={20} />, active: location.pathname === "/profile" },
    { name: "Settings", path: "/settings", icon: <Settings size={20} />, active: location.pathname === "/settings" },
    { name: "Requests", path: "/requests", icon: <InboxIcon size={20} />, active: location.pathname === "/requests" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9f9f9]">
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
          w-48 shrink-0 border-r border-gray-200 bg-black
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full text-white">
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-gray-800">
            <Link to="/dashboard" className="flex items-center">
              <ZenithLogo className="text-white" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  ${item.active 
                    ? "bg-[#1a1a1a] text-[#9efa06]" 
                    : "text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                  }
                `}
              >
                <span className={`${item.active ? "text-[#9efa06]" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 mt-auto border-t border-gray-800">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
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
        {/* Sidebar toggle button - always visible on mobile, visible when sidebar is closed on desktop */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
            aria-label="Toggle Menu"
          >
            <Menu size={24} />
          </Button>
          <div className="lg:hidden ml-auto"></div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
