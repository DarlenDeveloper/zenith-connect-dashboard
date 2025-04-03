
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getSubscriptionStatus } from "@/lib/stripe";
import { toast } from "sonner";

interface PaymentRequiredRouteProps {
  children: ReactNode;
}

const PaymentRequiredRoute = ({ children }: PaymentRequiredRouteProps) => {
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        if (!user) {
          setHasSubscription(false);
          setIsLoading(false);
          return;
        }
        
        const { hasSubscription, error } = await getSubscriptionStatus();
        
        if (error) {
          toast.error("Failed to check subscription status");
          console.error(error);
        }
        
        setHasSubscription(hasSubscription);
      } catch (error) {
        console.error("Error checking subscription:", error);
        setHasSubscription(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSubscription();
  }, [user, location.pathname]); // Re-check when the path changes
  
  if (isLoading) {
    return null; // Show loading state or spinner
  }
  
  if (!hasSubscription) {
    return <Navigate to="/payment-required" replace />;
  }
  
  return <>{children}</>;
};

export default PaymentRequiredRoute;
