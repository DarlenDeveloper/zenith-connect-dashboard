import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Loader2 } from "lucide-react";
import { notify, notifySuccess, notifyError, notifyWarning, notifyInfo } from '@/utils/notification';
import { createNotification } from '@/utils/create-notification';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NotificationDemo = () => {
  const { user } = useAuth();
  const [notifTitle, setNotifTitle] = useState('Test Notification');
  const [notifMessage, setNotifMessage] = useState('This is a test notification with sound');
  const [notifType, setNotifType] = useState('info');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRealNotification = async () => {
    if (!user) {
      notifyError('You must be logged in to create a notification');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createNotification({
        userId: user.id,
        type: notifType,
        title: notifTitle,
        message: notifMessage
      });

      if (result.success) {
        notifySuccess('Notification created successfully');
      } else {
        notifyError('Failed to create notification');
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      notifyError('An error occurred while creating the notification');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <header className="h-16 shrink-0 bg-white flex items-center px-6 justify-between border-b border-gray-100 shadow-sm">
          <div className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Notification Demo</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            <Card className="bg-white shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle>Basic Notifications</CardTitle>
                <CardDescription>
                  Try different notification types with sounds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={() => notify({
                      title: 'Default Notification',
                      message: 'This is a default notification with sound',
                    })}
                    variant="outline"
                    className="flex justify-start items-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    Default Notification
                  </Button>

                  <Button 
                    onClick={() => notifySuccess('This is a success notification with sound')}
                    variant="outline"
                    className="flex justify-start items-center gap-2 border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Success Notification
                  </Button>

                  <Button 
                    onClick={() => notifyError('This is an error notification with sound')}
                    variant="outline"
                    className="flex justify-start items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Error Notification
                  </Button>

                  <Button 
                    onClick={() => notifyWarning('This is a warning notification with sound')}
                    variant="outline"
                    className="flex justify-start items-center gap-2 border-amber-200 text-amber-600 hover:bg-amber-50"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Warning Notification
                  </Button>

                  <Button 
                    onClick={() => notifyInfo('This is an info notification with sound')}
                    variant="outline"
                    className="flex justify-start items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Info className="h-4 w-4" />
                    Info Notification
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
                <CardDescription>
                  Customize notifications with different options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={() => notify({
                      title: 'With Title',
                      message: 'This notification has a custom title',
                      type: 'info'
                    })}
                    variant="outline"
                    className="flex justify-start items-center gap-2"
                  >
                    Custom Title
                  </Button>

                  <Button 
                    onClick={() => notify({
                      message: 'This notification stays visible for 10 seconds',
                      duration: 10000,
                      type: 'info'
                    })}
                    variant="outline"
                    className="flex justify-start items-center gap-2"
                  >
                    Long Duration (10s)
                  </Button>

                  <Button 
                    onClick={() => notify({
                      title: 'Silent Notification',
                      message: 'This notification does not play a sound',
                      playSound: false,
                      type: 'info'
                    })}
                    variant="outline"
                    className="flex justify-start items-center gap-2"
                  >
                    No Sound
                  </Button>

                  <Button 
                    onClick={() => {
                      notify({
                        title: 'Multiple Notifications',
                        message: 'Multiple notifications stacked',
                        type: 'info'
                      });
                      
                      // Add sequential notifications with delays
                      setTimeout(() => {
                        notifySuccess('Second notification');
                        setTimeout(() => {
                          notifyWarning('Third notification');
                        }, 1000);
                      }, 1000);
                    }}
                    variant="outline"
                    className="flex justify-start items-center gap-2"
                  >
                    Sequential Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-sm border-gray-100 mt-6 mb-6">
            <CardHeader>
              <CardTitle>Create Real Database Notification</CardTitle>
              <CardDescription>
                Add a notification to the database to test real-time notification with sound
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="notification-type">Notification Type</Label>
                    <Select 
                      value={notifType} 
                      onValueChange={setNotifType}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Information</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="conversation">Conversation</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="ai">AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notification-title">Title</Label>
                    <Input 
                      id="notification-title" 
                      className="mt-2"
                      value={notifTitle} 
                      onChange={(e) => setNotifTitle(e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notification-message">Message</Label>
                  <Input 
                    id="notification-message" 
                    className="mt-2"
                    value={notifMessage} 
                    onChange={(e) => setNotifMessage(e.target.value)} 
                  />
                </div>
                <Button 
                  onClick={handleCreateRealNotification}
                  className="w-full md:w-auto mt-2"
                  disabled={isCreating || !user}
                >
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Real Notification
                </Button>
                {!user && (
                  <p className="text-xs text-red-500">You must be logged in to create real notifications</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-gray-100 mt-6">
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
              <CardDescription>
                Implementation guide for developers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Basic Usage:</h3>
                  <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
                    {`import { notify } from '@/utils/notification';

// Basic notification with sound
notify({
  title: 'Notification Title',
  message: 'This is the notification message',
  type: 'success', // 'default', 'success', 'error', 'warning', 'info'
});

// Or use the helper methods
import { notifySuccess, notifyError, notifyWarning, notifyInfo } from '@/utils/notification';

notifySuccess('This is a success message');
notifyError('This is an error message');`}
                  </pre>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Add Custom Sound Files:</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Add your sound files to <code className="bg-gray-200 px-1 py-0.5 rounded">public/sounds/</code> directory:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>notification.mp3</li>
                    <li>mixkit-confirmation-tone.mp3</li>
                    <li>error.mp3</li>
                    <li>info.mp3</li>
                    <li>warning.mp3</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default NotificationDemo; 