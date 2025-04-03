
import React from "react";
import { Button } from "@/components/ui/button";

interface CurrentSubscriptionInfoProps {
  plan: string;
  price: string;
  nextBillingDate: string;
  isActive?: boolean;
}

const CurrentSubscriptionInfo = ({
  plan,
  price,
  nextBillingDate,
  isActive = true
}: CurrentSubscriptionInfoProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
      
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div>
          <h3 className="font-medium text-lg">{plan}</h3>
          <p className="text-gray-500">{price}</p>
        </div>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {isActive ? "Active" : "Inactive"}
        </div>
      </div>
      
      <div className="py-4">
        <p className="text-gray-600 mb-2">Your next billing date is <strong>{nextBillingDate}</strong></p>
        <div className="flex flex-wrap gap-3 mt-3">
          <Button variant="outline">Change Plan</Button>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            Cancel Subscription
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CurrentSubscriptionInfo;
