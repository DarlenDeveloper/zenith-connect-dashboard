import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { logUserAction, LogActions } from '@/utils/user-logs';

// Interface for User data from DB
export interface User {
  id: string; // UUID
  user_id: string; // Owner user UUID
  user_ref_id: string; // e.g., USR0001
  name: string;
  email: string;
  phone_number: string | null;
  pin: string; // 4-digit PIN for authentication
  role: string; // 'admin', 'user', etc.
  is_active: boolean;
  created_at: string;
}

// Interface for the context value
interface UserContextType {
  users: User[];
  selectedUser: User | null;
  setSelectedUserId: (userId: string | null) => void;
  loadingUsers: boolean;
  authenticateUser: (userId: string, password: string) => Promise<boolean>;
  authenticatedUserIds: string[];
  userRequired: boolean;
  setUserRequired: (required: boolean) => void;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserIdState] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  // Track which users are authenticated
  const [authenticatedUserIds, setAuthenticatedUserIds] = useState<string[]>([]);
  // Track if user authentication is required
  const [userRequired, setUserRequired] = useState<boolean>(true);

  // Load initial selected user from sessionStorage if it exists in authenticated users
  useEffect(() => {
    // Check session storage for authenticated users
    const storedAuthenticatedUsers = sessionStorage.getItem('authenticatedUserIds');
    if (storedAuthenticatedUsers) {
      try {
        const parsedIds = JSON.parse(storedAuthenticatedUsers);
        if (Array.isArray(parsedIds)) {
          setAuthenticatedUserIds(parsedIds);
        }
      } catch (e) {
        // Invalid JSON, clear the item
        sessionStorage.removeItem('authenticatedUserIds');
      }
    }

    const storedUserId = sessionStorage.getItem('selectedUserId');
    if (storedUserId) {
      setSelectedUserIdState(storedUserId);
    }
  }, []);

  // Fetch users when user logs in
  useEffect(() => {
    if (!user) {
      setUsers([]);
      setSelectedUserIdState(null); // Clear selection on logout
      setAuthenticatedUserIds([]); // Clear authenticated users
      sessionStorage.removeItem('selectedUserId');
      sessionStorage.removeItem('authenticatedUserIds');
      setLoadingUsers(false);
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', user.id) // RLS also handles this, but explicit check is fine
          .eq('is_active', true) // Only fetch active users
          .order('name', { ascending: true });

        if (error) throw error;
        
        const fetchedUsers = data || [];
        setUsers(fetchedUsers);

        // Ensure the stored selected user is valid, active, and authenticated
        const currentSelectedId = sessionStorage.getItem('selectedUserId');
        const isValidSelection = fetchedUsers.some(user => 
          user.id === currentSelectedId && authenticatedUserIds.includes(user.id)
        );
        
        if (isValidSelection) {
            setSelectedUserIdState(currentSelectedId);
        } else {
            // If invalid selection, clear selection
            setSelectedUserIdState(null);
            sessionStorage.removeItem('selectedUserId');
        }

      } catch (error: any) {
        toast.error(`Failed to load users: ${error.message}`);
        setUsers([]); // Clear users on error
        setSelectedUserIdState(null);
        sessionStorage.removeItem('selectedUserId');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();

    // Set up real-time subscription for users table
    const usersSubscription = supabase
      .channel('users-channel')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public', 
          table: 'users',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersSubscription);
    };
  }, [user, authenticatedUserIds]);

  // Function to authenticate user with password
  const authenticateUser = async (userId: string, password: string): Promise<boolean> => {
    // Find the user
    const userToAuth = users.find(u => u.id === userId);
    if (!userToAuth) return false;

    // Validate the entered PIN against the user's PIN in the database
    if (password === userToAuth.pin) {
      // Only authentication for this browser session - won't affect other computers
      const newAuthenticatedUsers = [userId];
      setAuthenticatedUserIds(newAuthenticatedUsers);
      
      // Store authenticated users in sessionStorage (only affects current browser session)
      sessionStorage.setItem('authenticatedUserIds', JSON.stringify(newAuthenticatedUsers));
      
      // Automatically set this user as the selected user for this session
      setSelectedUserIdState(userId);
      sessionStorage.setItem('selectedUserId', userId);
      
      // Log authentication action - Using enhanced logging utility
      try {
        // Use the user-logs utility to properly record both the admin and the authenticated user
        await logUserAction(
          LogActions.USER_AUTHENTICATED,
          {
            authenticated_user_id: userId,
            user_ref_id: userToAuth.user_ref_id,
            user_name: userToAuth.name,
            user_role: userToAuth.role
          }
        );
      } catch (err) {
        console.error('Error logging user authentication:', err);
      }
      
      // Log admin login event
      try {
        // Also log a specific ADMIN_LOGIN action to track when an admin logs in as a user
        await logUserAction(
          'ADMIN_LOGIN', // New action type for tracking admin logins specifically
          {
            admin_action: 'logged in as user',
            target_user_id: userId,
            target_user_ref_id: userToAuth.user_ref_id,
            target_user_name: userToAuth.name
          }
        );
      } catch (err) {
        console.error('Error logging admin login:', err);
      }
      
      // Notify user about user switch
      toast.success(`User ${userToAuth.name} is now active`);
      
      return true;
    }
    
    return false;
  };

  // Function to update selected user ID and store it
  const setSelectedUserId = useCallback((userId: string | null) => {
    // Only allow setting to an authenticated user
    if (userId && !authenticatedUserIds.includes(userId)) {
      // This shouldn't happen normally as the UI should prevent it,
      // but adding as a safeguard
      console.warn("Attempted to select an unauthenticated user.");
      return;
    }
    
    setSelectedUserIdState(userId);
    if (userId) {
      sessionStorage.setItem('selectedUserId', userId);
      
      // Log the user selection action using the enhanced logger
      try {
        const selectedUserData = users.find(user => user.id === userId);
        if (selectedUserData) {
          // Use the new user-logs utility to properly record both users
          logUserAction(
            LogActions.USER_SELECTED,
            {
              selected_user_id: userId,
              selected_user_ref_id: selectedUserData.user_ref_id,
              selected_user_name: selectedUserData.name,
              selected_user_role: selectedUserData.role
            }
          ).catch(error => console.error('Error logging user selection:', error));
        }
      } catch (err) {
        console.error('Error logging user selection:', err);
      }
    } else {
      sessionStorage.removeItem('selectedUserId');
    }
  }, [authenticatedUserIds, users, user]);

  // Find the selected user object based on the ID
  const selectedUser = useMemo(() => {
    return users.find(user => user.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  // Memoize the context value
  const value = useMemo(() => ({
    users,
    selectedUser,
    setSelectedUserId,
    loadingUsers,
    authenticateUser,
    authenticatedUserIds,
    userRequired,
    setUserRequired
  }), [users, selectedUser, setSelectedUserId, loadingUsers, authenticateUser, authenticatedUserIds, userRequired]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the User context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 