import { useEffect, useState } from "react";
import { useUser, User } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Users, Search } from "lucide-react";
import UserPasswordDialog from "@/components/UserPasswordDialog";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const NoUserSelected = () => {
  const { users, loadingUsers } = useUser();
  const [selectedUserForAuth, setSelectedUserForAuth] = useState<User | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleUserClick = (user: User) => {
    setSelectedUserForAuth(user);
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordVerified = (success: boolean) => {
    if (success) {
      // The user context has already been updated with the selected user
      // Just close the dialog
      setIsPasswordDialogOpen(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    searchTerm === "" || 
    user.user_ref_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 flex-1 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full mx-auto shadow-lg border-none">
        <CardHeader className="text-center pb-0">
          <CardTitle className="text-2xl">Select a User to Continue</CardTitle>
          <p className="text-gray-500 mt-1">
            You must select and authenticate as a user before using this feature
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingUsers ? (
            <div className="py-8 flex justify-center">
              <Loading text="Loading users" size="md" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-4 inline-flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No users found. You must create a user first.</p>
              <Button 
                onClick={() => navigate('/users?createUser=true')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create First User
              </Button>
            </div>
          ) : (
            <div>
              {/* Search input */}
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by user ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2"
                />
              </div>
              
              {/* List of users with scrolling */}
              <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto pr-1">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No users match your search
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.user_ref_id}</p>
                        </div>
                        <Button
                          className="ml-auto bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Select
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUserForAuth && (
        <UserPasswordDialog
          isOpen={isPasswordDialogOpen}
          onClose={() => setIsPasswordDialogOpen(false)}
          user={selectedUserForAuth}
          onVerify={handlePasswordVerified}
        />
      )}
    </div>
  );
};

export default NoUserSelected; 