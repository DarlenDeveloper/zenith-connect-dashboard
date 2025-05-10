import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import PhoneInput from "@/components/PhoneInput";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logUserAction, LogActions } from "@/utils/user-logs";
import { useUser } from "@/contexts/UserContext";
import { Spinner } from "@/components/ui/spinner";
import NoUserSelected from "@/components/NoUserSelected";

const Settings = () => {
  const { user } = useAuth();
  const { selectedUser } = useUser();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    email: user?.email || "",
    phone_number: "",
    organization_name: "",
  });

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }
    
    setLoadingProfile(true);
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, organization_name, phone_number')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') {
             throw error;
          }
          console.warn("Profile not found for user, using defaults.");
          setProfile({
            name: user.name || user.email?.split('@')[0] || "",
            email: user.email || "",
            phone_number: "",
            organization_name: user.organizationName || ""
          });
        } else if (data) {
          setProfile({
            name: data.name || "",
            email: user.email || "",
            phone_number: data.phone_number || "",
            organization_name: data.organization_name || "",
          });
        }
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: err.message || "Could not fetch profile data.",
        });
        setProfile({
            name: user.name || user.email?.split('@')[0] || "",
            email: user.email || "",
            phone_number: "",
            organization_name: user.organizationName || ""
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [user, toast]);

  const [notifications, setNotifications] = useState({
    emailDigest: true,
    conversationAlerts: true,
    marketingEmails: false,
    serviceUpdates: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordResetInterval: "90",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name' || name === 'organization_name' || name === 'email') {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setProfile(prev => ({ ...prev, phone_number: value }));
  };

  const handleNotificationChange = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSecuritySettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleTwoFactor = () => {
    setSecuritySettings(prev => ({ 
      ...prev, 
      twoFactorAuth: !prev.twoFactorAuth 
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const updates = {
        name: profile.name,
        organization_name: profile.organization_name,
        phone_number: profile.phone_number,
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
      
      await logUserAction(
        LogActions.UPDATE_USER_PROFILE,
        { 
          profile_id: user.id,
          updatedFields: Object.keys(updates),
          table: 'profiles'
        }
      );

    } catch (error: any) {
       toast({
          variant: "destructive",
          title: "Error saving settings",
          description: error.message || "Could not update profile information.",
        });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-white p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
          <div className="mt-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-sm font-medium inline-flex items-center">
            Admin-only area
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal and organization information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingProfile ? (
                  <div className="flex items-center justify-center py-10">
                    <Spinner size="lg" className="mr-3" />
                    <p className="text-muted-foreground">Loading profile...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profile.email}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <PhoneInput
                        value={profile.phone_number}
                        onChange={handlePhoneChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input
                        id="organizationName"
                        name="organization_name"
                        value={profile.organization_name}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={saving || loadingProfile}>
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <Spinner size="sm" className="mr-2" /> Saving
                    </span>
                  ) : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailDigest">Daily Email Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a summary of the day's activities
                      </p>
                    </div>
                    <Switch
                      id="emailDigest"
                      checked={notifications.emailDigest}
                      onCheckedChange={() => handleNotificationChange("emailDigest")}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="conversationAlerts">Conversation Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new customer conversations
                      </p>
                    </div>
                    <Switch
                      id="conversationAlerts"
                      checked={notifications.conversationAlerts}
                      onCheckedChange={() => handleNotificationChange("conversationAlerts")}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotions, tips, and product updates
                      </p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={notifications.marketingEmails}
                      onCheckedChange={() => handleNotificationChange("marketingEmails")}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="serviceUpdates">Service Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Important information about your AIRIES service
                      </p>
                    </div>
                    <Switch
                      id="serviceUpdates"
                      checked={notifications.serviceUpdates}
                      onCheckedChange={() => handleNotificationChange("serviceUpdates")}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button variant="outline">Cancel</Button>
                <Button onClick={() => toast({ title: "Note", description: "Saving Notification settings not yet implemented." })}>
                  Save changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactorAuth">Two-factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      id="twoFactorAuth"
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={handleToggleTwoFactor}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    
                    <div></div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <select
                        id="sessionTimeout"
                        name="sessionTimeout"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSecurityChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="240">4 hours</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="passwordResetInterval">Password Reset Interval (days)</Label>
                      <select
                        id="passwordResetInterval"
                        name="passwordResetInterval"
                        value={securitySettings.passwordResetInterval}
                        onChange={handleSecurityChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button variant="outline">Cancel</Button>
                 <Button onClick={() => toast({ title: "Note", description: "Saving Security settings not yet implemented." })}>
                  Save changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
