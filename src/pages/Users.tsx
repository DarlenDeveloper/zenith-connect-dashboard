import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser, User } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, PlusCircle, Edit, Trash2, Phone, KeyRound, UserCheck, Filter, Mail, UserCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useNavigate } from "react-router-dom";

// Zod schema for new user form
const newUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone_number: z.string().optional(),
  pin: z.string().length(4, { message: "PIN must be exactly 4 digits." }).regex(/^\d{4}$/, { message: "PIN must be 4 digits." }),
  role: z.enum(["admin", "user", "manager"])
});

// Zod schema for edit user form (PIN is optional)
const editUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone_number: z.string().optional(),
  pin: z.string().length(4, { message: "PIN must be exactly 4 digits." }).regex(/^\d{4}$/, { message: "PIN must be 4 digits." }).optional(),
  role: z.enum(["admin", "user", "manager"])
});

type NewUserFormData = z.infer<typeof newUserSchema>;
type EditUserFormData = z.infer<typeof editUserSchema>;

const Users = () => {
  const { user } = useAuth();
  const { users, loadingUsers, setUserRequired, selectedUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Set user selection not required when entering Users page
  useEffect(() => {
    setUserRequired(false);
    
    // Restore the requirement when leaving the page
    return () => {
      setUserRequired(true);
    };
  }, [setUserRequired]);
  
  // Automatically create an admin user when there are no users in the system
  useEffect(() => {
    // Set flag for first user
    const noUsers = users.length === 0;
    setIsFirstUser(noUsers);
    
    // If there are no users and we're not still loading
    if (!loadingUsers && noUsers) {
      // Automatically create an admin user if authenticated
      if (user) {
        const createAdminUser = async () => {
          try {
            setIsSubmitting(true);
            
            // Get user email from auth user
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            
            const email = userData.user.email || '';
            
            // Generate the admin user ID (first user is always USR0001)
            const userRefId = 'USR0001';
            
            // Insert the default admin user
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                name: 'ADMIN',
                email: email,
                phone_number: '',
                pin: '1221',  // Default PIN
                role: 'admin',
                user_ref_id: userRefId,
                user_id: user.id, // Link to the authenticated user
                is_active: true,
              });
            
            if (insertError) throw insertError;
            
            toast.success(`Admin user created with PIN: 1221`, {
              description: 'You can now use this user to access the system',
              duration: 6000
            });
          } catch (error: any) {
            console.error('Error creating admin user:', error);
            toast.error('Could not create admin user automatically', {
              description: 'Please try creating a user manually',
              duration: 6000
            });
            
            // Only open the dialog if auto-creation fails
            setTimeout(() => {
              setIsAddUserDialogOpen(true);
            }, 100);
          } finally {
            setIsSubmitting(false);
          }
        };
        
        createAdminUser();
      } else {
        // If URL parameter is set, open the dialog for manual creation
        if (location.search.includes('createUser=true')) {
          setTimeout(() => {
            setIsAddUserDialogOpen(true);
          }, 100);
          
          // Remove the query parameter to avoid reopening the dialog on refresh
          navigate('/users', { replace: true });
        }
      }
    }
  }, [users, loadingUsers, user, location.search, navigate]);

  // Add user form
  const { 
    register: registerAdd, 
    handleSubmit: handleSubmitAdd, 
    reset: resetAdd, 
    formState: { errors: addErrors } 
  } = useForm<NewUserFormData>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      role: "user"
    }
  });
  
  // Edit user form
  const { 
    register: registerEdit, 
    handleSubmit: handleSubmitEdit, 
    reset: resetEdit, 
    setValue: setEditValue,
    formState: { errors: editErrors } 
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema)
  });
  
  // Set up form with user data when edit dialog opens
  useEffect(() => {
    if (userToEdit && isEditUserDialogOpen) {
      setEditValue('name', userToEdit.name);
      setEditValue('email', userToEdit.email);
      setEditValue('phone_number', userToEdit.phone_number || '');
      setEditValue('role', userToEdit.role as "admin" | "user" | "manager");
    }
  }, [userToEdit, isEditUserDialogOpen, setEditValue]);

  // Reset edit form when dialog closes
  useEffect(() => {
    if (!isEditUserDialogOpen) {
      resetEdit();
      setUserToEdit(null);
    }
  }, [isEditUserDialogOpen, resetEdit]);

  // Handle form submission to add a new user
  const handleAddUser: SubmitHandler<NewUserFormData> = async (formData) => {
    if (!user) return toast.error("Auth user not found");
    setIsSubmitting(true);
    try {
      // Check if this is the first user being created
      const { data: existingUsers, error: countError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
        
      if (countError) throw new Error(`Failed to check existing users: ${countError.message}`);
      
      // If no users exist yet, user ID will be USR0001 regardless of role
      let userRefId;
      if (!existingUsers || existingUsers.length === 0) {
        userRefId = 'USR0001'; // First user is always USR0001 and has admin access
      } else {
        // For subsequent users, generate the ID normally
        const { data: sequenceData, error: sequenceError } = await supabase.rpc('get_next_user_sequence');
        
        if (sequenceError) throw new Error(`Failed to get next user ID sequence: ${sequenceError.message}`);
        if (sequenceData === null) throw new Error('Could not determine next user ID sequence.');
  
        const nextSequence = sequenceData as number;
        
        // 2. Format the new user_ref_id (e.g., USR0002, USR0003, etc.)
        const prefix = formData.role === 'admin' ? 'ADM' : formData.role === 'manager' ? 'MGR' : 'USR';
        userRefId = `${prefix}${String(nextSequence).padStart(4, '0')}`; // Format to 4 digits
      }

      // 3. Insert the user with the generated ID
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          ...formData,
          user_ref_id: userRefId,
          user_id: user.id, // Link to the authenticated user
          is_active: true,
        });

      if (insertError) {
        if (insertError.message.includes('duplicate key value violates unique constraint')) {
          throw new Error(`Generated User ID '${userRefId}' was already taken. Please try again.`);
        } else {
          throw insertError;
        }
      }
      
      // Special notification for first user
      if (userRefId === 'USR0001') {
        toast.success(`First user created with ID USR0001! This user has admin access.`);
      } else {
        toast.success(`User ${formData.name} added successfully with ID ${userRefId}!`);
      }
      
      resetAdd();
      setIsAddUserDialogOpen(false);

    } catch (error: any) {
      toast.error(`Failed to add user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle actions for users
  const handleEditUser = (userToEdit: User) => {
    setUserToEdit(userToEdit);
    setIsEditUserDialogOpen(true);
  };
  
  const handleSaveEditedUser = async (formData: EditUserFormData) => {
    if (!user) return toast.error("Auth user not found");
    if (!userToEdit) return toast.error("No user selected for editing");
    
    setIsSubmitting(true);
    try {
      // No need to check for existing admins - users can have any role
      
      // Update the user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone_number || null,
          role: formData.role,
          // Only update PIN if a new one is provided
          ...(formData.pin ? { pin: formData.pin } : {})
        })
        .eq('id', userToEdit.id);
        
      if (updateError) throw updateError;
      
      toast.success(`User ${formData.name} updated successfully!`);
      setIsEditUserDialogOpen(false);
      setUserToEdit(null);
      
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = (user: User) => { toast.info("Delete functionality not yet implemented."); };

  // Stats counts
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const managerUsers = users.filter(user => user.role === 'manager').length;
  const regularUsers = users.filter(user => user.role === 'user').length;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <header className="h-16 shrink-0 bg-white flex items-center px-6 justify-between border-b border-gray-100 shadow-sm">
          <div className="flex items-center">
            <UsersIcon className="mr-2 h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Users Management</h1>
          </div>
          {(selectedUser?.role === 'admin' || selectedUser?.user_ref_id === 'USR0001') ? (
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitAdd(handleAddUser)}>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" {...registerAdd('name')} />
                      {addErrors.name && <p className="text-xs text-red-600">{addErrors.name.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...registerAdd('email')} />
                      {addErrors.email && <p className="text-xs text-red-600">{addErrors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input id="phone_number" placeholder="Optional" {...registerAdd('phone_number')} />
                      {addErrors.phone_number && <p className="text-xs text-red-600">{addErrors.phone_number.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select defaultValue="user" {...registerAdd('role')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      {addErrors.role && <p className="text-xs text-red-600">{addErrors.role.message}</p>}
                      {isFirstUser && (
                        <p className="text-xs text-amber-600 font-medium">
                          First user will have ID 'USR0001' and will have admin access
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pin">PIN</Label>
                      <Input 
                        id="pin" 
                        type="password" 
                        placeholder="4-digit PIN" 
                        {...registerAdd('pin')} 
                        maxLength={4}
                        inputMode="numeric"
                      />
                      <p className="text-xs text-gray-500">Create a 4-digit PIN for user authentication</p>
                      {addErrors.pin && <p className="text-xs text-red-600">{addErrors.pin.message}</p>}
                    </div>
                    <p className="text-xs text-gray-600">
                      Users with the 'admin' role will have access to administrative features.
                    </p>
                  </div>
                  
                  <DialogFooter className="mt-6">
                    <Button variant="outline" type="button" onClick={() => setIsAddUserDialogOpen(false)} className="mr-2">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                      {isSubmitting ? 'Adding...' : 'Add User'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-sm font-medium">
              Admin access required (USR0001 or admin role)
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium mb-1">Admin Users</p>
                  <p className="text-3xl font-bold">{adminUsers}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">Manager Users</p>
                  <p className="text-3xl font-bold">{managerUsers}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Filter className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-white rounded-xl shadow-md overflow-hidden border-none">
            <CardHeader className="pb-0">
              <CardTitle>Manage Your Users</CardTitle>
              <CardDescription>View and manage all users in your organization</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingUsers ? (
                <div className="min-h-[300px] flex items-center justify-center">
                  <Loading text="Loading users" size="md" />
                </div>
              ) : (
                users.length === 0 ? (
                  <div className="min-h-[300px] flex flex-col items-center justify-center py-10">
                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                      <UsersIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-800 mb-2">No Users Found</h2>
                    <p className="text-gray-600 mb-6 max-w-md text-center">
                      You haven't added any users yet. Add users to get started with your organization.
                    </p>
                    {(selectedUser?.role === 'admin' || selectedUser?.user_ref_id === 'USR0001') ? (
                      <Button 
                        onClick={() => setIsAddUserDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Your First User
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md">
                        Admin access required (USR0001 or admin role)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                      <div 
                        key={user.id} 
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow duration-200 border border-gray-100"
                      >
                        <div className="p-5 border-b border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                {user.name.charAt(0)}
                              </div>
                              <div className="ml-3 max-w-[150px] overflow-hidden">
                                <h3 className="font-semibold text-gray-900 truncate" title={user.name}>{user.name}</h3>
                                <p className="text-sm text-gray-500 truncate" title={user.user_ref_id}>{user.user_ref_id}</p>
                              </div>
                            </div>
                            <Badge 
                              variant="outline"
                              className={
                                user.role === 'admin' 
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-200 border-none" 
                                : user.role === 'manager'
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-none"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-none"
                              }
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {user.phone_number || 'No phone number'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <KeyRound className="h-4 w-4 mr-2 text-gray-400" />
                            PIN: ••••
                          </div>
                        </div>
                        <div className="px-5 py-3 bg-gray-50 flex justify-end space-x-2">
                          {(selectedUser?.role === 'admin' || selectedUser?.user_ref_id === 'USR0001') ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditUser(user)} 
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteUser(user)} 
                                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </>
                          ) : (
                            <div className="text-xs text-gray-500">
                              Admin access required to edit users
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {userToEdit && (
            <form onSubmit={handleSubmitEdit(handleSaveEditedUser)}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input 
                    id="edit-name" 
                    defaultValue={userToEdit.name} 
                    {...registerEdit('name')} 
                  />
                  {editErrors.name && <p className="text-xs text-red-600">{editErrors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    type="email" 
                    defaultValue={userToEdit.email} 
                    {...registerEdit('email')} 
                  />
                  {editErrors.email && <p className="text-xs text-red-600">{editErrors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone_number">Phone Number</Label>
                  <Input 
                    id="edit-phone_number" 
                    placeholder="Optional" 
                    defaultValue={userToEdit.phone_number || ''} 
                    {...registerEdit('phone_number')} 
                  />
                  {editErrors.phone_number && <p className="text-xs text-red-600">{editErrors.phone_number.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select 
                    defaultValue={userToEdit.role} 
                    {...registerEdit('role')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  {editErrors.role && <p className="text-xs text-red-600">{editErrors.role.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-pin">PIN (Optional - leave blank to keep current)</Label>
                  <Input 
                    id="edit-pin" 
                    type="password" 
                    placeholder="4-digit PIN" 
                    {...registerEdit('pin')} 
                    maxLength={4}
                    inputMode="numeric"
                  />
                  <p className="text-xs text-gray-500">Leave blank to keep the current PIN</p>
                  {editErrors.pin && <p className="text-xs text-red-600">{editErrors.pin.message}</p>}
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" type="button" onClick={() => setIsEditUserDialogOpen(false)} className="mr-2">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Users; 