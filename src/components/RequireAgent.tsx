import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAgent } from "@/contexts/AgentContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import NoAgentSelected from "./NoAgentSelected";

interface RequireAgentProps {
  children: React.ReactNode;
}

const RequireAgent = ({ children }: RequireAgentProps) => {
  const { user } = useAuth();
  const { selectedAgent, agentRequired } = useAgent();
  const location = useLocation();

  useEffect(() => {
    // Show a toast message when trying to access a protected route without an agent
    if (agentRequired && !selectedAgent && user) {
      toast.error("Agent authentication required", {
        description: "You must select and authenticate as an agent to continue",
        id: "agent-required" // Prevent duplicate toasts
      });
    }
  }, [selectedAgent, agentRequired, user]);

  // If user isn't authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If agent selection is required but none is selected, show agent selector
  if (agentRequired && !selectedAgent) {
    return <NoAgentSelected />;
  }

  // If we have an authenticated agent (or agent isn't required), proceed
  return <>{children}</>;
};

export default RequireAgent; 