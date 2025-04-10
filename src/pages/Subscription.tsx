import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CurrentSubscriptionInfo from "@/components/subscription/CurrentSubscriptionInfo";
import PaymentMethodInfo from "@/components/subscription/PaymentMethodInfo";
import PlansSection from "@/components/subscription/PlansSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Interface matching the new subscriptions table
interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch subscription details directly from the new 'subscriptions' table
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          // Optionally filter by active status if needed, e.g.: .in('status', ['active', 'past_due'])
          .maybeSingle(); // Use maybeSingle since user_id is unique
            
        if (error) {
          console.error('Error fetching subscription details:', error);
          setSubscription(null);
        } else {
          setSubscription(data);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setSubscription(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionDetails();
  }, [user]);

  // Determine current plan name and next billing date from the fetched subscription state
  const currentPlanId = subscription?.status === 'active' || subscription?.status === 'past_due' ? subscription.plan_id : null;
  const currentPlanName = 
      currentPlanId === 'starter' ? 'Starter Plan' : 
      currentPlanId === 'pro' ? 'Popular Plan' : 
      currentPlanId === 'enterprise' ? 'Enterprise Plan' : 
      null;

  const nextBillingDate = subscription?.current_period_end 
    ? format(new Date(subscription.current_period_end), 'MMMM d, yyyy') 
    : null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-medium">Subscription</h1>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          <div className="max-w-4xl mx-auto">
            {currentPlanName ? (
              <>
                {/* Current Plan Section */}
                <CurrentSubscriptionInfo 
                  plan={currentPlanName}
                  price={
                    currentPlanId === 'starter' ? '300,000 UGX/month, billed monthly' : 
                    currentPlanId === 'pro' ? '800,000 UGX/month, billed monthly' : 
                    'Custom pricing, billed monthly'
                  }
                  nextBillingDate={nextBillingDate || 'Not available'}
                />
                
                {/* Payment Method Section (Needs data source if implemented) */}
                <PaymentMethodInfo />
              </>
            ) : (
              // Optional: Show message if no active subscription
              <div className="bg-white rounded-lg border p-6 mb-6 text-center">
                <p className="text-gray-600">You do not have an active subscription.</p>
              </div>
            )}
            
            {/* Available Plans Section */}
            <PlansSection currentPlan={currentPlanId || undefined} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
