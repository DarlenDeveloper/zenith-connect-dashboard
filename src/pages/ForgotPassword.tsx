import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ZenithLogo from "@/components/ZenithLogo";
import { Spinner } from "@/components/ui/spinner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await resetPassword(email);
      setSubmitted(true);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <ZenithLogo className="h-12 w-auto text-black-bean-700" />
        </div>
        
        <Card className="w-full shadow-xl border-0 rounded-lg">
          <CardHeader className="pt-8">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Reset Your Password</CardTitle>
            <CardDescription className="text-center text-gray-500">
              {submitted 
                ? "Check your email for a reset link" 
                : "Enter your email and we'll send you instructions"}
            </CardDescription>
          </CardHeader>
          
          {submitted ? (
            <CardContent className="space-y-4 text-center px-8">
              <p className="py-4 text-gray-800">
                We've sent reset instructions to <strong>{email}</strong>
              </p>
              <p className="text-gray-500 text-sm">
                If you don't see the email, check your spam folder or make sure you entered the correct email address.
              </p>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 px-8">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
                <Button type="submit" className="w-full bg-sun-500 hover:bg-sun-600 text-white" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Spinner size="sm" className="mr-2" /> Sending
                    </span>
                  ) : "Send reset instructions"}
                </Button>
              </CardFooter>
            </form>
          )}
          
          <div className="p-6 pt-0 text-center">
            <Link to="/login" className="text-black-bean-600 hover:text-black-bean-700 font-medium text-sm">
              Return to sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
