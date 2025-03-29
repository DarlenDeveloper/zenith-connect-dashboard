
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ZenithLogo from "@/components/ZenithLogo";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <ZenithLogo className="h-12 w-auto" />
        </div>
        
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Reset Your Password</CardTitle>
            <CardDescription className="text-center">
              {submitted 
                ? "Check your email for a reset link" 
                : "Enter your email and we'll send you instructions"}
            </CardDescription>
          </CardHeader>
          
          {submitted ? (
            <CardContent className="space-y-4 text-center">
              <p className="py-4">
                We've sent reset instructions to <strong>{email}</strong>
              </p>
              <p className="text-muted-foreground text-sm">
                If you don't see the email, check your spam folder or make sure you entered the correct email address.
              </p>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
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
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset instructions"}
                </Button>
              </CardFooter>
            </form>
          )}
          
          <div className="p-6 pt-0 text-center">
            <Link 
              to="/login" 
              className="text-zenith-700 hover:text-zenith-800 font-medium text-sm"
            >
              Return to sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
