
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LockIcon, CreditCard, CheckCircle } from "lucide-react";

const PaymentRequired = () => {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6">
          <h1 className="text-xl font-medium">Payment Required</h1>
        </header>
        
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <div className="text-center mb-8">
              <div className="bg-yellow-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <LockIcon size={36} className="text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Subscription Required</h2>
              <p className="text-gray-600">You need an active subscription to access this feature</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
                <h3 className="font-semibold text-lg mb-2">Starter</h3>
                <div className="text-3xl font-bold mb-2">$19<span className="text-sm font-normal text-gray-500">/month</span></div>
                <p className="text-gray-600 text-sm mb-4">Perfect for small businesses</p>
                <ul className="space-y-2 mb-6 flex-grow">
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Up to 100 AI calls</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Basic analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Email support</span>
                  </li>
                </ul>
                <Button onClick={() => navigate("/subscription")}>
                  Subscribe Now
                </Button>
              </div>
              
              <div className="border-2 border-black rounded-lg p-6 flex flex-col relative">
                <div className="absolute top-0 right-0 bg-black text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  RECOMMENDED
                </div>
                <h3 className="font-semibold text-lg mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-2">$49<span className="text-sm font-normal text-gray-500">/month</span></div>
                <p className="text-gray-600 text-sm mb-4">For growing businesses</p>
                <ul className="space-y-2 mb-6 flex-grow">
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Unlimited AI calls</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Custom AI training</span>
                  </li>
                </ul>
                <Button className="bg-black text-white hover:bg-gray-800" onClick={() => navigate("/subscription")}>
                  Subscribe Now
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
                <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
                <div className="text-3xl font-bold mb-2">$199<span className="text-sm font-normal text-gray-500">/month</span></div>
                <p className="text-gray-600 text-sm mb-4">For large organizations</p>
                <ul className="space-y-2 mb-6 flex-grow">
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Everything in Pro</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">SSO authentication</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                </ul>
                <Button variant="outline" onClick={() => navigate("/subscription")}>
                  Contact Sales
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate("/subscription")}
                className="flex items-center"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                View All Subscription Options
              </Button>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default PaymentRequired;
