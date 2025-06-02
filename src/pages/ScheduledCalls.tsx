import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Calendar, Clock, User, Mail, Globe, MessageSquare, PhoneCall, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { logUserAction, LogActions } from "@/utils/user-logs";
import NoUserSelected from "@/components/NoUserSelected";
import { notifySuccess, notifyError, notifyTechIssue } from "@/utils/notification";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import AddCallModal from "@/components/AddCallModal";

interface CustomerCall {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
  created_at: string;
  status: string;
}

const ScheduledCalls = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedUser, userRequired } = useUser();
  const [customerCalls, setCustomerCalls] = useState<CustomerCall[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If user selection is required but none is selected, show the NoUserSelected component
  if (userRequired && !selectedUser) {
    return <NoUserSelected />;
  }

  const fetchCustomerCalls = async () => {
    setListLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('customer_calls')
        .select('id, name, phone, notes, created_at, status', { count: 'exact' })
        .eq('created_by', user?.id) // Filter by authenticated user
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomerCalls(data || []);
      setTotalCalls(count || 0);
    } catch (error: any) {
      console.error("Error fetching customer calls:", error);
      notifyTechIssue("Failed to load your scheduled calls");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCustomerCalls();

      // Setup real-time subscription
      const callsSubscription = supabase
        .channel('customer_calls')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'customer_calls', 
            filter: `created_by=eq.${user.id}` // Filter real-time updates by user
          },
          (payload) => {
            console.log('Change received in customer_calls!', payload);
            fetchCustomerCalls(); // Refetch when changes occur
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(callsSubscription);
      };
    }
  }, [user?.id]);

  const handleCallAdded = () => {
    fetchCustomerCalls(); // Refresh the list after a call is added
    setIsModalOpen(false); // Close the modal
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Scheduled Calls</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Call
          </Button>
        </div>

        {/* Summary Cards Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls Created</CardTitle>
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalls}</div>
              <p className="text-xs text-muted-foreground">
                Calls you have scheduled
              </p>
            </CardContent>
          </Card>
          {/* Add other cards here if needed, e.g., Average response time */}
        </div>

        {/* Call List Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Scheduled Calls</h2>
          {listLoading ? (
            <div className="flex justify-center items-center">
              <Spinner /> Loading calls...
            </div>
          ) : customerCalls.length === 0 ? (
            <p className="text-center text-muted-foreground">No calls scheduled yet.</p>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[150px]">Name</TableHead>
                        <TableHead className="w-[150px]">Phone Number</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="w-[200px]">Scheduled At</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerCalls.map((call) => (
                        <TableRow key={call.id}>
                          <TableCell className="font-medium">{call.name}</TableCell>
                          <TableCell>{call.phone}</TableCell>
                          <TableCell className="text-muted-foreground">{call.notes || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(call.created_at).toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline">{call.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
      <AddCallModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCallAdded={handleCallAdded} 
      />
    </DashboardLayout>
  );
};

export default ScheduledCalls; 