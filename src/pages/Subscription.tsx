
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CurrentSubscriptionInfo from "@/components/subscription/CurrentSubscriptionInfo";
import PaymentMethodInfo from "@/components/subscription/PaymentMethodInfo";
import PlansSection from "@/components/subscription/PlansSection";

const SubscriptionPage = () => {
  // Current subscription is hardcoded for now
  // In a real app, this would come from your API or context
  const currentPlan = "pro";

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
            {/* Current Plan Section */}
            <CurrentSubscriptionInfo 
              plan="Pro Plan"
              price="$99.99/month, billed monthly"
              nextBillingDate="July 24, 2023"
            />
            
            {/* Payment Method Section */}
            <PaymentMethodInfo />
            
            {/* Available Plans Section */}
            <PlansSection currentPlan={currentPlan} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
