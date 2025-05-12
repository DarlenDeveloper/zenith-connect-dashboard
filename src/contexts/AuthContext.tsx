import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { logUserAction, LogActions } from "@/utils/user-logs";
import { toast } from "sonner";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  organizationName: string;
  hasSubscription?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  isEmailConfirmed: boolean;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        // Check if email is confirmed
        if (currentSession?.user) {
          setIsEmailConfirmed(currentSession.user.email_confirmed_at !== null);
          setTimeout(() => {
            getUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsEmailConfirmed(false);
        }
        
        // Handle email confirmation event
        if (event === 'USER_UPDATED') {
          // This event is fired when a user confirms their email
          if (currentSession?.user?.email_confirmed_at) {
            toast.success("Email Confirmed", {
              description: "Your email has been confirmed successfully!"
            });
          }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setSupabaseUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        getUserProfile(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getUserProfile = async (userId: string) => {
    try {
      // Fetch profile data from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) throw profileError;
      
      // Fetch user data from auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (profileData) {
        const authUser: AuthUser = {
          id: userId,
          email: userData.user.email || "",
          name: profileData.name || userData.user.email?.split('@')[0] || "Zenith User",
          organizationName: profileData.organization_name || "Zenith Inc.",
          hasSubscription: profileData.has_subscription || false
        };
        
        setUser(authUser);
      } else {
        // Handle case where profile data is null
        const authUser: AuthUser = {
          id: userId,
          email: userData.user.email || "",
          name: userData.user.email?.split('@')[0] || "Zenith User",
          organizationName: "Zenith Inc.",
          hasSubscription: false
        };
        
        setUser(authUser);
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      toast.error("Error loading profile", {
        description: "We couldn't load your user profile. Please try logging in again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a function to log authentication events with admin ID
  const logAuthEvent = async (
    eventType: 'LOGIN' | 'LOGOUT',
    userId: string,
    userEmail?: string
  ) => {
    try {
      // For login/logout, we use the admin's ID as the user_id since there is no selected user yet
      await logUserAction(
        eventType === 'LOGIN' ? LogActions.LOGIN : LogActions.LOGOUT,
        {
          auth_user_email: userEmail,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error(`Error logging ${eventType}:`, error);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // First check if the email is confirmed by getting user
      const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (userError) throw userError;
      
      // Check if email is confirmed
      if (userData?.user && userData.user.email_confirmed_at === null) {
        // Email not confirmed, show a message and ask to confirm
        toast.error("Email Not Confirmed", {
          description: "Please check your inbox and confirm your email before logging in."
        });
        
        // Offer to resend the confirmation email
        toast("Resend Confirmation", {
          description: "Didn't receive the email? Click to resend.",
          action: {
            label: "Resend",
            onClick: () => resendConfirmationEmail(email)
          },
          duration: 10000 // Show for 10 seconds
        });
        
        // Sign out since we don't want unconfirmed users to be logged in
        await supabase.auth.signOut();
        throw new Error("Please confirm your email address before logging in.");
      }

      // Log the login event after successful authentication
      if (userData?.user) {
        setTimeout(() => {
          logAuthEvent('LOGIN', userData.user.id, userData.user.email);
        }, 1000); // Small delay to ensure authentication completes
      }

      toast.success("Login Successful", {
        description: "Welcome back to Zenith Portal"
      });
    } catch (error: any) {
      toast.error("Login Failed", {
        description: error.message || "An unknown error occurred"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setLoading(true);
    
    try {
      if (!userData.email || !userData.password || !userData.name || !userData.organizationName) {
        throw new Error("All fields are required");
      }

      if (!userData.agreedToTerms) {
        throw new Error("You must agree to the terms and conditions");
      }

      // Sign up with email confirmation enabled
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: window.location.origin + '/login', // Redirect to login page after confirmation
          data: {
            name: userData.name,
            organizationName: userData.organizationName,
            phoneNumber: userData.phoneNumber
          }
        }
      });

      if (error) throw error;
      
      // Check if email confirmation was sent
      if (data?.user && data.user.email_confirmed_at === null) {
        toast.info("Verification Email Sent", {
          description: "Please check your inbox and confirm your email address to complete signup.",
          duration: 10000
        });
      } else {
        toast.success("Account Created", {
          description: "Welcome to Zenith Portal"
        });
      }
    } catch (error: any) {
      toast.error("Signup Failed", {
        description: error.message || "An unknown error occurred"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Log the logout event before actually logging out
      if (supabaseUser?.id) {
        await logAuthEvent('LOGOUT', supabaseUser.id, supabaseUser.email);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged Out", {
        description: "You have been successfully logged out"
      });
    } catch (error: any) {
      toast.error("Logout Failed", {
        description: error.message || "An unknown error occurred"
      });
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;

      toast.success("Password Reset Email Sent", {
        description: "Check your inbox for instructions to reset your password"
      });
    } catch (error: any) {
      toast.error("Password Reset Failed", {
        description: error.message || "An unknown error occurred"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to resend confirmation email
  const resendConfirmationEmail = async (email: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin + '/login',
        },
      });

      if (error) throw error;

      toast.success("Confirmation Email Sent", {
        description: "Please check your inbox for the confirmation link"
      });
    } catch (error: any) {
      toast.error("Failed to Send Email", {
        description: error.message || "An unknown error occurred"
      });
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
    resendConfirmationEmail,
    isEmailConfirmed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
