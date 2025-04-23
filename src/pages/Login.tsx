import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import ZenithLogo from "@/components/ZenithLogo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsEmailNotConfirmed(false);
    
    try {
      setIsLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      
      // Check for specific email not confirmed error
      if (error.message && error.message.includes("Email not confirmed")) {
        setIsEmailNotConfirmed(true);
      } else {
        setErrorMessage(error.message || "Failed to sign in. Please check your credentials.");
      }
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
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-500">
              Sign in to access your AIRIES Portal
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-8">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              {isEmailNotConfirmed && (
                <Alert className="bg-yellow-50 text-yellow-800 border-yellow-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your email address has not been confirmed yet. Please check your inbox for a confirmation email or 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-1 text-yellow-800 underline"
                      onClick={() => navigate("/forgot-password")}
                    >
                      request a new confirmation
                    </Button>.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
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
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-black-bean-600 hover:text-black-bean-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" /> Signing in
                  </span>
                ) : "Sign in"}
              </Button>
              
              <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                Powered By Najod
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
