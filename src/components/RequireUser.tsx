import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import NoUserSelected from "./NoUserSelected";

interface RequireUserProps {
  children: React.ReactNode;
}

const RequireUser = ({ children }: RequireUserProps) => {
  const { user } = useAuth();
  const { selectedUser, userRequired } = useUser();
  const location = useLocation();

  useEffect(() => {
    // Show a toast message when trying to access a protected route without a user
    if (userRequired && !selectedUser && user) {
      toast.error("User authentication required", {
        description: "You must select and authenticate as a user to continue",
        id: "user-required" // Prevent duplicate toasts
      });
    }
  }, [selectedUser, userRequired, user]);

  // If user isn't authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user selection is required but none is selected, show user selector
  if (userRequired && !selectedUser) {
    return <NoUserSelected />;
  }

  // If we have an authenticated user (or user isn't required), proceed
  return <>{children}</>;
};

export default RequireUser; 