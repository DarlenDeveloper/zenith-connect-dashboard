
import React, { useState } from "react";
import { toast } from "sonner";
import { redirectToFlutterwavePayment } from "@/lib/flutterwave";
import PlanCard from "./PlanCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define plan prices
const PLANS = {
  starter: { price: 25 },
  pro: { price: 99.99 },
  enterprise: { price: 299.99 }
};

interface PlansSectionProps {
  currentPlan?: string;
}

const PlansSection = ({ currentPlan = "pro" }: PlansSectionProps) => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleSubscription = async (plan: 'starter' | 'pro' | 'enterprise') => {
    try {
      setIsLoading({ ...isLoading, [plan]: true });
      setCheckoutError(null);
      
      // Redirect to Flutterwave Payment
      const result = await redirectToFlutterwavePayment(plan, PLANS[plan].price);
      
      if (result?.error) {
        const errorMessage = result.error.message || 'Failed to initiate payment. Please try again.';
        setCheckoutError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error starting payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again later.';
      setCheckoutError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading({ ...isLoading, [plan]: false });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
      
      {checkoutError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error starting payment</AlertTitle>
          <AlertDescription>{checkoutError}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Starter Plan */}
        <PlanCard
          title="Starter"
          price={<>$25.00<span className="text-sm font-normal text-gray-500">/month</span></>}
          features={[
            { text: "Up to 5 AI conversations" },
            { text: "Basic analytics" },
            { text: "Email support" }
          ]}
          buttonText="Coming Soon"
          buttonVariant="outline"
          isDisabled={true}
        />
        
        {/* Pro Plan */}
        <PlanCard
          title="Pro"
          price={<>$99.99<span className="text-sm font-normal text-gray-500">/month</span></>}
          features={[
            { text: "Unlimited AI conversations" },
            { text: "Advanced analytics" },
            { text: "Priority support" },
            { text: "Custom AI training" }
          ]}
          buttonText={currentPlan === "pro" ? "Current Plan" : "Subscribe Now"}
          onClick={currentPlan !== "pro" ? () => handleSubscription('pro') : undefined}
          isLoading={isLoading.pro}
          isCurrent={currentPlan === "pro"}
          isDisabled={currentPlan === "pro"}
        />
        
        {/* Enterprise Plan */}
        <PlanCard
          title="Enterprise"
          price={<>$299.99<span className="text-sm font-normal text-gray-500">/month</span></>}
          features={[
            { text: "Everything in Pro" },
            { text: "Dedicated account manager" },
            { text: "SSO authentication" },
            { text: "Custom integrations" },
            { text: "24/7 phone support" }
          ]}
          buttonText="Contact Sales"
          buttonVariant="outline"
          onClick={() => handleSubscription('enterprise')}
          isLoading={isLoading.enterprise}
          isCurrent={currentPlan === "enterprise"}
        />
      </div>
    </div>
  );
};

export default PlansSection;
