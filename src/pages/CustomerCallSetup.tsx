import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Calendar, Clock, User, Mail, Globe, MessageSquare, PhoneCall, PlusCircle, Search } from "lucide-react";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface CustomerData {
  name: string;
  phone: string;
  email: string;
  preferredLanguage: string;
  timeZone: string;
  notes: string;
  callPurpose: string;
  scheduledTime?: string;
}

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
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  // If user selection is required but none is selected, show the NoUserSelected component
  if (userRequired && !selectedUser) {
    return <NoUserSelected />;
  }

  const fetchCustomerCalls = async () => {
    setListLoading(true);
    try {
      let query = supabase
        .from('customer_calls')
        .select('id, name, phone, notes, created_at, status', { count: 'exact' })
        .eq('created_by', user?.id);

      // Apply search term filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`);
      }

      // Apply date filter
      if (dateRange?.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        query = query.gte('created_at', fromDate.toISOString());
      }
      if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', toDate.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

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
  }, [user?.id, searchTerm, dateRange]); // Add searchTerm and dateRange as dependencies

  const handleCallAdded = () => {
    fetchCustomerCalls(); // Refresh the list after a call is added
    setIsModalOpen(false); // Close the modal
  };

  const getDateFilterLabel = () => {
    if (!dateRange?.from && !dateRange?.to) {
      return "Filter by Date";
    }
    if (dateRange.from && !dateRange.to) {
      return `From ${format(dateRange.from, "PPP")}`;
    }
    if (!dateRange.from && dateRange.to) {
      return `Up to ${format(dateRange.to, "PPP")}`;
    }
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`;
    }
    return "Filter by Date";
  };

  const clearDateFilter = () => {
    setDateRange(undefined);
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

        {/* Filter and Search Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
           <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search calls by name, phone, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal w-full md:w-[240px]">
                <Calendar className="mr-2 h-4 w-4" />
                {getDateFilterLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
              <div className="p-2 flex justify-end gap-2 border-t">
                <Button variant="outline" size="sm" onClick={clearDateFilter}>Clear</Button>
                <Button size="sm" onClick={() => setIsDateFilterOpen(false)}>Apply</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Call List Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Scheduled Calls</h2>
          {listLoading ? (
            <div className="flex justify-center items-center">
              <Spinner /> Loading calls...
            </div>
          ) : customerCalls.length === 0 ? (
            <p>{searchTerm || dateRange ? "No matching calls found." : "No calls scheduled yet."}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Scheduled At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>{call.name}</TableCell>
                      <TableCell>{call.phone}</TableCell>
                      <TableCell>{call.notes}</TableCell>
                      <TableCell>{new Date(call.created_at).toLocaleString()}</TableCell>
                      <TableCell><Badge>{call.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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