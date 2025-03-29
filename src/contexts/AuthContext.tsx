
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  organizationName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

export interface SignupData {
  organizationName: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  agreedToTerms: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("zenith_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function - in a real app this would call an API
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo, just check if email and password are not empty
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Mock successful login - in a real app, you'd validate credentials with backend
      const mockUser = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        organizationName: "Zenith Inc.",
      };

      // Save user to local storage
      localStorage.setItem("zenith_user", JSON.stringify(mockUser));
      setUser(mockUser);

      toast({
        title: "Login Successful",
        description: "Welcome back to Zenith Portal",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData: SignupData) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validate required fields
      if (!userData.email || !userData.password || !userData.name || !userData.organizationName) {
        throw new Error("All fields are required");
      }

      if (!userData.agreedToTerms) {
        throw new Error("You must agree to the terms and conditions");
      }

      // Mock successful signup
      const mockUser = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email: userData.email,
        name: userData.name,
        organizationName: userData.organizationName,
      };

      // Save user to local storage
      localStorage.setItem("zenith_user", JSON.stringify(mockUser));
      setUser(mockUser);

      toast({
        title: "Account Created",
        description: "Welcome to Zenith Portal",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("zenith_user");
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!email) {
        throw new Error("Email is required");
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for instructions to reset your password",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
