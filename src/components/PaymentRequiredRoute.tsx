
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentRequiredRouteProps {
  children: ReactNode;
}

const PaymentRequiredRoute = ({ children }: PaymentRequiredRouteProps) => {
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for payment success query parameter and show toast if present
    const searchParams = new URLSearchParams(location.search);
    const subscriptionStatus = searchParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      toast.success('Subscription activated successfully! Welcome to the premium plan.');
      
      // Remove the query parameter after showing the toast
      searchParams.delete('subscription');
      navigate({ pathname: location.pathname, search: searchParams.toString() }, { replace: true });
    }
  }, [location.search, navigate, location.pathname]);
  
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        if (!user) {
          setHasSubscription(false);
          setIsLoading(false);
          return;
        }
        
        // Use our database function to check if the subscription is active
        const { data, error } = await supabase.rpc('is_subscription_active', {
          user_uuid: user.id
        });
        
        if (error) {
          console.error("Error checking subscription status:", error);
          toast.error("Failed to verify subscription status");
          setHasSubscription(false);
        } else {
          setHasSubscription(data);
          
          // If subscription is active but profile isn't updated, fix it
          if (data && !user.hasSubscription) {
            await supabase
              .from('profiles')
              .update({ has_subscription: true })
              .eq('id', user.id);
          }
        }
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
