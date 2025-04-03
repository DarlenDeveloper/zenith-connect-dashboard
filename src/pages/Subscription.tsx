
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { redirectToCheckout } from "@/lib/stripe";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Stripe product ID and prices with the correct price ID
const PRODUCT_ID = "prod_S2XN2kBxHKYfsa";
// Use the correct price ID provided
const PRICE_IDS = {
  starter: "price_1R8SJ2PEXvlHYAZ3oUpo24IN", 
  pro: "price_1R8SJ2PEXvlHYAZ3oUpo24IN", 
  enterprise: "price_1R8SJ2PEXvlHYAZ3oUpo24IN" 
};

const SubscriptionPage = () => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleSubscription = async (plan: 'starter' | 'pro' | 'enterprise') => {
    try {
      setIsLoading({ ...isLoading, [plan]: true });
      setCheckoutError(null);
      
      // Redirect to Stripe Checkout
      const result = await redirectToCheckout(PRICE_IDS[plan]);
      
      if (result?.error) {
        const errorMessage = result.error.message || 'Failed to initiate checkout. Please try again.';
        setCheckoutError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again later.';
      setCheckoutError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading({ ...isLoading, [plan]: false });
    }
  };

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
            {checkoutError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error starting checkout</AlertTitle>
                <AlertDescription>{checkoutError}</AlertDescription>
              </Alert>
            )}
            
            {/* Current Plan */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-lg">Pro Plan</h3>
                  <p className="text-gray-500">$99.99/month, billed monthly</p>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </div>
              </div>
              
              <div className="py-4">
                <p className="text-gray-600 mb-2">Your next billing date is <strong>July 24, 2023</strong></p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <Button variant="outline">Change Plan</Button>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Cancel Subscription</Button>
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <CreditCard className="mr-3 text-gray-400" size={24} />
                  <div>
                    <h3 className="font-medium">Visa ending in 4242</h3>
                    <p className="text-gray-500">Expires 12/2025</p>
                  </div>
                </div>
                <div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
              
              <div className="py-4">
                <Button variant="outline">Add Payment Method</Button>
              </div>
            </div>
            
            {/* Available Plans */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Starter Plan */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all h-full flex flex-col">
                  <h3 className="font-medium text-lg mb-2">Starter</h3>
                  <div className="text-2xl font-bold mb-4">$25.00<span className="text-sm font-normal text-gray-500">/month</span></div>
                  
                  <ul className="space-y-2 mb-6 flex-grow">
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Up to 5 AI conversations</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Basic analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Email support</span>
                    </li>
                  </ul>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    disabled={true}
                  >
                    Coming Soon
                  </Button>
                </div>
                
                {/* Pro Plan (Current) */}
                <div className="border-2 border-black rounded-lg p-5 relative h-full flex flex-col shadow-md">
                  <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    CURRENT
                  </div>
                  
                  <h3 className="font-medium text-lg mb-2">Pro</h3>
                  <div className="text-2xl font-bold mb-4">$99.99<span className="text-sm font-normal text-gray-500">/month</span></div>
                  
                  <ul className="space-y-2 mb-6 flex-grow">
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Unlimited AI conversations</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Advanced analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Priority support</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Custom AI training</span>
                    </li>
                  </ul>
                  
                  <Button className="w-full bg-black text-white hover:bg-gray-800">Current Plan</Button>
                </div>
                
                {/* Enterprise Plan */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all h-full flex flex-col">
                  <h3 className="font-medium text-lg mb-2">Enterprise</h3>
                  <div className="text-2xl font-bold mb-4">Contact Sales<span className="text-sm font-normal text-gray-500"></span></div>
                  
                  <ul className="space-y-2 mb-6 flex-grow">
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Everything in Pro</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Dedicated account manager</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">SSO authentication</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Custom integrations</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">24/7 phone support</span>
                    </li>
                  </ul>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleSubscription('enterprise')}
                    disabled={isLoading.enterprise}
                  >
                    {isLoading.enterprise ? 'Processing...' : 'Contact Sales'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
