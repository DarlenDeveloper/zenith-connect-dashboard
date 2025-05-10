import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

/**
 * RequireAdmin - Component to restrict access to admin-only routes
 * 
 * This component protects routes that should only be accessible to users with the 'admin' role.
 * It redirects non-admin users to the dashboard and shows an error message.
 * Admin access is granted to:
 * 1. Users with the 'admin' role
 * 2. The user with ID 'USR0001' is always considered an admin
 */
interface RequireAdminProps {
  children: React.ReactNode;
}

const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { user } = useAuth();
  const { selectedUser } = useUser();
  const location = useLocation();

  // Check if the current user is an admin
  const isAdmin = React.useMemo(() => {
    // The special user with ID 'USR0001' is always an admin
    if (selectedUser?.user_ref_id === 'USR0001') {
      return true;
    }
    
    // Otherwise, check for admin role
    return selectedUser?.role === 'admin';
  }, [selectedUser]);

  useEffect(() => {
    // Show a toast message when trying to access an admin-only route without admin privileges
    if (user && !isAdmin) {
      toast.error("Admin access required", {
        description: "This area requires administrator privileges",
        id: "admin-required" // Prevent duplicate toasts
      });
    }
  }, [user, isAdmin]);

  // If user isn't authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have admin role, redirect to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // If we have an admin user, proceed
  return <>{children}</>;
};

export default RequireAdmin; 