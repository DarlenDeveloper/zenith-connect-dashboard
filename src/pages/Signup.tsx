import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, SignupData } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import ZenithLogo from "@/components/ZenithLogo";
import { Spinner } from "@/components/ui/spinner";

const Signup = () => {
  const [formData, setFormData] = useState<SignupData>({
    organizationName: "",
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    agreedToTerms: false,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePhoneChange = (value: string) => {
    setFormData({
      ...formData,
      phoneNumber: value,
    });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordsMatch(formData.password === value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    
    try {
      setIsLoading(true);
      await signup(formData);
      navigate("/dashboard");
    } catch (error) {
      // Error is handled in the auth context
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-100">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="flex justify-center mb-8">
            <ZenithLogo className="h-12 w-auto text-black-bean-700" />
          </div>
          
          <Card className="w-full shadow-xl border-0 rounded-lg">
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-center text-gray-500">
                Get started with AIRIES' AI-powered customer care solutions
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 px-8">
                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="text-gray-700">Organization Name</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    placeholder="Your Company Name"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">Full Name (Gov't issued name)</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-700">Phone Number</Label>
                  <PhoneInput 
                    value={formData.phoneNumber} 
                    onChange={handlePhoneChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    className={`w-full ${!passwordsMatch ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {!passwordsMatch && (
                    <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="agreedToTerms"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => 
                      setFormData({
                        ...formData,
                        agreedToTerms: checked as boolean,
                      })
                    }
                    required
                  />
                  <Label 
                    htmlFor="agreedToTerms" 
                    className="text-sm leading-none text-gray-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to AIRIES'{" "}
                    <a href="#" className="text-black-bean-600 hover:text-black-bean-700 underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-black-bean-600 hover:text-black-bean-700 underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
                <Button 
                  type="submit" 
                  className="w-full bg-sun-500 hover:bg-sun-600 text-white"
                  disabled={isLoading || !passwordsMatch}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Spinner size="sm" className="mr-2" /> Creating account
                    </span>
                  ) : "Create account"}
                </Button>
                
                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-black-bean-600 hover:text-black-bean-700 font-medium"
                  >
                    Sign in
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
    </div>
  );
};

export default Signup;
