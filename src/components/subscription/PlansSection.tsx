import React, { useState } from "react";
import { toast } from "sonner";
import { redirectToFlutterwavePayment } from "@/lib/flutterwave";
import PlanCard from "./PlanCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Define plan prices
const PLANS = {
  starter: { price: 477000 }, // Updated price
  pro: { price: 677000 }, // Updated price
  enterprise: { price: 1500000 } // Price ignored as it redirects to sales
};

interface PlansSectionProps {
  currentPlan?: string;
}

const PlansSection = ({ currentPlan = "" }: PlansSectionProps) => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscription = async (plan: 'starter' | 'pro' | 'enterprise') => {
    if (plan === 'enterprise') {
      navigate('/contact-sales');
      return;
    }
    
    try {
      setIsLoading({ ...isLoading, [plan]: true });
      setCheckoutError(null);
      
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
          price={<>477,000<span className="text-sm font-normal text-gray-500"> UGX/month</span></>}
          features={[
            { text: "Up to 200 client calls" },
            { text: "Up to 5 AI conversations" },
            { text: "Basic analytics" },
            { text: "Email support" }
          ]}
          buttonText="Subscribe Now"
          buttonVariant="default"
          onClick={() => handleSubscription('starter')}
          isLoading={isLoading.starter}
          isDisabled={currentPlan === "starter"}
          isCurrent={currentPlan === "starter"}
        />
        
        {/* Pro Plan */}
        <div className="relative">
          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-sun-500 text-white rounded-md px-3 py-1 font-medium z-10">
            RECOMMENDED
          </Badge>
          <PlanCard
            title="Popular"
            price={<>677,000<span className="text-sm font-normal text-gray-500"> UGX/month</span></>}
            features={[
              { text: "Up to 500 client calls" },
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
        </div>
        
        {/* Enterprise Plan */}
        <PlanCard
          title="Enterprise"
          price={<>Contact Sales</>}
          features={[
            { text: "Everything in Popular" },
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
