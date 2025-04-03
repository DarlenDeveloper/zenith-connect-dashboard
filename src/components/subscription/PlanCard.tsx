
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PlanFeature {
  text: string;
}

interface PlanCardProps {
  title: string;
  price: string | React.ReactNode;
  features: PlanFeature[];
  buttonText: string;
  onClick?: () => void;
  isLoading?: boolean;
  isCurrent?: boolean;
  isDisabled?: boolean;
  buttonVariant?: "default" | "outline";
}

const PlanCard = ({
  title,
  price,
  features,
  buttonText,
  onClick,
  isLoading = false,
  isCurrent = false,
  isDisabled = false,
  buttonVariant = "default"
}: PlanCardProps) => {
  return (
    <div 
      className={`${
        isCurrent 
          ? "border-2 border-black rounded-lg p-5 relative shadow-md" 
          : "border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all"
      } h-full flex flex-col`}
    >
      {isCurrent && (
        <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
          CURRENT
        </div>
      )}
      
      <h3 className="font-medium text-lg mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-4">
        {price}
      </div>
      
      <ul className="space-y-2 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
            <span className="text-sm">{feature.text}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        variant={buttonVariant} 
        className={`w-full ${isCurrent ? "bg-black text-white hover:bg-gray-800" : ""}`}
        onClick={onClick}
        disabled={isDisabled || isLoading}
      >
        {isLoading ? "Processing..." : buttonText}
      </Button>
    </div>
  );
};

export default PlanCard;
