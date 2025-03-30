
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, MessageSquare, CreditCard, 
  Settings, LogOut, InboxIcon, Menu, PanelLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ZenithLogo from "@/components/ZenithLogo";
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
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} />, active: location.pathname === "/dashboard" },
    { name: "Conversations", path: "/conversations", icon: <MessageSquare size={20} />, active: location.pathname === "/conversations" },
    { name: "Subscription", path: "/subscription", icon: <CreditCard size={20} />, active: location.pathname === "/subscription" },
    { name: "Settings", path: "/settings", icon: <Settings size={20} />, active: location.pathname === "/settings" },
    { name: "Requests", path: "/requests", icon: <InboxIcon size={20} />, active: location.pathname === "/requests" },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#f9f9f9] w-full">
        <Sidebar
          className="bg-black border-gray-800 border-r"
          collapsible="icon"
        >
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-gray-800">
            <Link to="/dashboard" className="flex items-center">
              <ZenithLogo className="text-white" />
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="py-6">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.active}
                    tooltip={item.name}
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <span className={`${item.active ? "text-[#9efa06]" : "text-gray-400"}`}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="mt-auto border-t border-gray-800">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              <span>Log out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sidebar toggle button */}
          <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6">
            <SidebarTrigger className="text-gray-500" />
            <div className="ml-auto"></div>
          </div>
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
