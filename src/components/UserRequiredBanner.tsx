import { UserCheck, AlertTriangle, Search } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import UserPasswordDialog from "./UserPasswordDialog";
import { Input } from "@/components/ui/input";

interface UserRequiredBannerProps {
  containerClassName?: string;
}

const UserRequiredBanner = ({ containerClassName = "" }: UserRequiredBannerProps) => {
  const { selectedUser, users, userRequired } = useUser();
  const [isSelectUserOpen, setIsSelectUserOpen] = useState(false);
  const [selectedUserForAuth, setSelectedUserForAuth] = useState<typeof users[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Don't show the banner if user is not required or if a user is already selected
  if (!userRequired || selectedUser) {
    return null;
  }

  const handleUserSelect = (user: typeof users[0]) => {
    setSelectedUserForAuth(user);
    setIsSelectUserOpen(true);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    searchTerm === "" || 
    user.user_ref_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`bg-amber-50 border-b border-amber-200 py-2 px-4 ${containerClassName}`}>
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
          <span className="text-amber-800 font-medium">User authentication required for this action</span>
        </div>
        
        <div className="flex items-center gap-2">
          {users && users.length > 0 ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                onClick={() => setIsSelectUserOpen(true)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Select User
              </Button>
              
              {isSelectUserOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 max-h-[90vh]">
                    <h2 className="text-xl font-semibold mb-4">Select a User</h2>
                    <p className="text-gray-600 mb-4">Choose a user to continue:</p>
                    
                    {/* Search input */}
                    <div className="mb-4 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by user ID, name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 py-2"
                      />
                    </div>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {filteredUsers.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          No users match your search
                        </div>
                      ) : (
                        filteredUsers.map(user => (
                          <div
                            key={user.id}
                            className="p-3 border border-gray-200 rounded-md hover:bg-blue-50 cursor-pointer flex items-center"
                            onClick={() => handleUserSelect(user)}
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">{user.name}</div>
                              <div className="flex text-xs">
                                <span className="text-gray-500">{user.user_ref_id}</span>
                                <span className="text-gray-400 mx-1">•</span>
                                <span className="text-gray-500">{user.role}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsSelectUserOpen(false);
                          setSearchTerm("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
              onClick={() => window.location.href = '/users'}
            >
              Create User
            </Button>
          )}
        </div>
      </div>
      
      {selectedUserForAuth && (
        <UserPasswordDialog
          isOpen={isSelectUserOpen}
          onClose={() => {
            setIsSelectUserOpen(false);
            setSelectedUserForAuth(null);
            setSearchTerm("");
          }}
          user={selectedUserForAuth}
          onVerify={(success) => {
            if (success) {
              setIsSelectUserOpen(false);
              setSelectedUserForAuth(null);
              setSearchTerm("");
            }
          }}
        />
      )}
    </div>
  );
};

export default UserRequiredBanner; 