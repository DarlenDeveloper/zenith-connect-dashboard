
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, 
  CreditCard, 
  CheckCircle2, 
  BadgeCheck,
  Zap,
  ArrowUpRight,
  Users,
  Mail,
  HeadphonesIcon,
  MessagesSquare,
  Settings2
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const PaymentRequired = () => {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium">Payment Required</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/subscription")}
            className="flex items-center gap-2"
            size="sm"
          >
            <CreditCard className="h-4 w-4" />
            View Plans
          </Button>
        </header>
        
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          <div className="max-w-3xl mx-auto">
            <Card className="mb-8 shadow-md border-0">
              <CardHeader className="text-center pb-2">
                <div className="bg-yellow-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={36} className="text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Subscription Required</h2>
                <p className="text-gray-600">You need an active subscription to access this feature</p>
              </CardHeader>
              <CardContent className="pt-4">
                <Separator className="mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Starter Plan */}
                  <Card className="border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow relative h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <h3 className="font-semibold text-lg">Starter</h3>
                      <div className="text-3xl font-bold mb-2">$19<span className="text-sm font-normal text-gray-500">/month</span></div>
                      <p className="text-gray-600 text-sm">Perfect for small businesses</p>
                    </CardHeader>
                    <CardContent className="py-2 flex-grow">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle2 size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">Up to 100 AI calls</span>
                        </li>
                        <li className="flex items-start">
                          <BadgeCheck size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">Basic analytics</span>
                        </li>
                        <li className="flex items-start">
                          <Mail size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">Email support</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        className="w-full" 
                        onClick={() => navigate("/subscription")}
                      >
                        Subscribe Now
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Pro Plan */}
                  <Card className="border-2 border-black rounded-lg shadow-md hover:shadow-lg transition-shadow relative h-full flex flex-col">
                    <Badge className="absolute top-0 right-0 bg-black text-white rounded-bl-lg rounded-tr-lg px-3 py-1 font-medium" variant="default">
                      RECOMMENDED
                    </Badge>
                    <CardHeader className="pb-2">
                      <h3 className="font-semibold text-lg">Pro</h3>
                      <div className="text-3xl font-bold mb-2">$49<span className="text-sm font-normal text-gray-500">/month</span></div>
                      <p className="text-gray-600 text-sm">For growing businesses</p>
                    </CardHeader>
                    <CardContent className="py-2 flex-grow">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Zap size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">Unlimited AI calls</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowUpRight size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">Advanced analytics</span>
                        </li>
                        <li className="flex items-start">
                          <MessagesSquare size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">Priority support</span>
                        </li>
                        <li className="flex items-start">
                          <Settings2 size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">Custom AI training</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        className="w-full bg-black text-white hover:bg-gray-800"
                        onClick={() => navigate("/subscription")}
                      >
                        Subscribe Now
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Enterprise Plan */}
                  <Card className="border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow relative h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <h3 className="font-semibold text-lg">Enterprise</h3>
                      <div className="text-3xl font-bold mb-2">$199<span className="text-sm font-normal text-gray-500">/month</span></div>
                      <p className="text-gray-600 text-sm">For large organizations</p>
                    </CardHeader>
                    <CardContent className="py-2 flex-grow">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle2 size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">Everything in Pro</span>
                        </li>
                        <li className="flex items-start">
                          <Users size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">Dedicated account manager</span>
                        </li>
                        <li className="flex items-start">
                          <BadgeCheck size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">SSO authentication</span>
                        </li>
                        <li className="flex items-start">
                          <HeadphonesIcon size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm">Custom integrations</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate("/subscription")}
                      >
                        Contact Sales
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default PaymentRequired;

