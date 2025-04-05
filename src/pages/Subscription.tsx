
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CurrentSubscriptionInfo from "@/components/subscription/CurrentSubscriptionInfo";
import PaymentMethodInfo from "@/components/subscription/PaymentMethodInfo";
import PlansSection from "@/components/subscription/PlansSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!user) return;
      
      try {
        // Check if subscription is active
        const { data: isActive, error: functionError } = await supabase.rpc(
          'is_subscription_active',
          { user_uuid: user.id }
        );
        
        if (functionError) {
          console.error('Error checking subscription status:', functionError);
          setIsLoading(false);
          return;
        }
        
        if (isActive) {
          // Fetch subscription details
          const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching subscription details:', error);
          } else if (data) {
            // Determine plan based on stored stripe_subscription_id prefix
            if (data.stripe_subscription_id?.includes('starter')) {
              setCurrentPlan('starter');
            } else if (data.stripe_subscription_id?.includes('pro')) {
              setCurrentPlan('pro');
            } else if (data.stripe_subscription_id?.includes('enterprise')) {
              setCurrentPlan('enterprise');
            } else {
              setCurrentPlan('pro'); // Default to pro if can't determine
            }
            
            // Format the next billing date
            if (data.current_period_end) {
              const endDate = new Date(data.current_period_end);
              setNextBillingDate(format(endDate, 'MMMM d, yyyy'));
            }
          }
        } else {
          setCurrentPlan(null);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionDetails();
  }, [user]);

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
            {currentPlan ? (
              <>
                {/* Current Plan Section */}
                <CurrentSubscriptionInfo 
                  plan={
                    currentPlan === 'starter' ? 'Starter Plan' : 
                    currentPlan === 'pro' ? 'Popular Plan' : 
                    'Enterprise Plan'
                  }
                  price={
                    currentPlan === 'starter' ? '300,000 UGX/month, billed monthly' : 
                    currentPlan === 'pro' ? '800,000 UGX/month, billed monthly' : 
                    'Custom pricing, billed monthly'
                  }
                  nextBillingDate={nextBillingDate || 'Not available'}
                />
                
                {/* Payment Method Section */}
                <PaymentMethodInfo />
              </>
            ) : null}
            
            {/* Available Plans Section */}
            <PlansSection currentPlan={currentPlan || undefined} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
