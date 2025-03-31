
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentRequiredRouteProps {
  children: ReactNode;
}

const PaymentRequiredRoute = ({ children }: PaymentRequiredRouteProps) => {
  const { user } = useAuth();
  
  // Simulate payment check - in a real app, you would check against a subscription API
  // This is a placeholder for demonstration purposes
  const hasActiveSubscription = user?.hasSubscription || false;
  
  if (!hasActiveSubscription) {
    return <Navigate to="/payment-required" replace />;
  }
  
  return <>{children}</>;
};

export default PaymentRequiredRoute;
