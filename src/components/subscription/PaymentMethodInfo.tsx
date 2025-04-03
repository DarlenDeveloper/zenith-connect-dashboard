
import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface PaymentMethodInfoProps {
  cardType?: string;
  lastFour?: string;
  expiryDate?: string;
}

const PaymentMethodInfo = ({
  cardType = "Visa",
  lastFour = "4242",
  expiryDate = "12/2025"
}: PaymentMethodInfoProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
      
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div className="flex items-center">
          <CreditCard className="mr-3 text-gray-400" size={24} />
          <div>
            <h3 className="font-medium">{cardType} ending in {lastFour}</h3>
            <p className="text-gray-500">Expires {expiryDate}</p>
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
  );
};

export default PaymentMethodInfo;
