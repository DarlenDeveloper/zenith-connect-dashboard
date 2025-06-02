import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { User, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { logUserAction, LogActions } from "@/utils/user-logs";
import { notifySuccess, notifyError, notifyTechIssue } from "@/utils/notification";

interface AddCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallAdded: () => void;
}

interface CustomerData {
  name: string;
  phone: string;
  notes: string;
}

const AddCallModal: React.FC<AddCallModalProps> = ({
  isOpen,
  onClose,
  onCallAdded,
}) => {
  const { user } = useAuth();
  const { selectedUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    notes: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomerData({
        name: '',
        phone: '',
        notes: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields and phone number format
      if (!customerData.name || !customerData.phone) {
        notifyError("Please fill in all required fields");
        setLoading(false); // Stop loading on validation error
        return;
      }

      // Basic phone number validation with country code (+256) and 9 digits
      const phoneRegex = /^\+256\d{9}$/;
      if (!phoneRegex.test(customerData.phone)) {
        notifyError("Please enter a valid Ugandan phone number including country code (e.g., +256712345678)");
        setLoading(false); // Stop loading on validation error
        return;
      }

      // Save to database
      const { data, error } = await supabase
        .from('customer_calls')
        .insert([
          {
            name: customerData.name,
            phone: customerData.phone,
            notes: customerData.notes,
            created_by: user?.id,
            user_id: selectedUser?.id, // Associate with the selected user if applicable
            status: 'scheduled' // Default status
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await logUserAction(
        LogActions.CREATE_ITEM,
        {
          user_id: selectedUser?.id || '',
          details: `Created call setup for customer: ${customerData.name}`
        }
      );

      notifySuccess("Call scheduled successfully!");
      onCallAdded(); // Notify parent to refresh the list and close modal

    } catch (error: any) {
      console.error('Error scheduling call:', error);
      notifyTechIssue("Failed to schedule call");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule New AI Call</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-4">
            <Label htmlFor="name" className="text-left flex items-center gap-2">
               <User className="h-4 w-4 text-muted-foreground" /> Customer Name
            </Label>
            <Input
              id="name"
              name="name"
              value={customerData.name}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div className="grid gap-4">
             <Label htmlFor="phone" className="text-left flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              value={customerData.phone}
              onChange={handleChange}
              placeholder="e.g., +256712345678 (start with +256)"
              required
            />
          </div>
           <div className="grid gap-4">
             <Label htmlFor="notes" className="text-left flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" /> Additional Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={customerData.notes}
              onChange={handleChange}
              placeholder="Add any relevant notes here"
              className="min-h-[100px]"
            />
          </div>
        </form>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Call'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCallModal; 