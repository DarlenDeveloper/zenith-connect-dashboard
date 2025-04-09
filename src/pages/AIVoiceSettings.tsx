import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { MicIcon, Play, Save, Plus, Trash2, Globe, VolumeX, Volume2, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Zod schema for form validation
const requestSchema = z.object({
  request_type: z.string().min(1, { message: "Request type is required" }),
  details: z.string().min(10, { message: "Details must be at least 10 characters long" }),
});
type RequestFormData = z.infer<typeof requestSchema>;

// Interface for AI Voice Request data from DB
interface AIVoiceRequest {
  id: string;
  user_id: string;
  request_type: string;
  details: string;
  status: string;
  resolution_notes: string | null;
  created_at: string;
}

const AIVoiceSettings = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AIVoiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  // Fetch existing requests
  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const { data, error } = await supabase
        .from("ai_voice_requests")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast.error(`Failed to load requests: ${error.message}`);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Effect for initial fetch and real-time updates
  useEffect(() => {
    if (!user) return;
    fetchRequests();

    const requestsSubscription = supabase
      .channel("ai-voice-requests-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_voice_requests" },
        (payload) => {
          console.log("AI request change detected:", payload);
          // Simple refetch on any change
          fetchRequests(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsSubscription);
    };
  }, [user]);

  // Handle form submission
  const onSubmit: SubmitHandler<RequestFormData> = async (formData) => {
    if (!user) {
      toast.error("You must be logged in to submit requests.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("ai_voice_requests")
        .insert({ ...formData, user_id: user.id }); // RLS checks user_id
      
      if (error) throw error;
      
      toast.success("Request submitted successfully!");
      reset(); // Clear the form
      // Real-time subscription will update the list
    } catch (error: any) {
      toast.error(`Failed to submit request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
    } catch (e) { return "Invalid Date"; }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <div className="flex items-center">
            <MicIcon className="mr-2 h-5 w-5 text-gray-500" />
            <h1 className="text-xl font-medium">AI Voice Requests</h1>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* New Request Form Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Submit a New Request</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="request_type" className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                    <Select 
                      onValueChange={(value) => setValue('request_type', value, { shouldValidate: true })}
                    >
                      <SelectTrigger id="request_type">
                        <SelectValue placeholder="Select request type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New Number">Request New Number</SelectItem>
                        <SelectItem value="Change Voice">Change AI Voice</SelectItem>
                        <SelectItem value="Update Details">Update Business Details</SelectItem>
                        <SelectItem value="Other">Other Request</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" {...register('request_type')} />
                    {errors.request_type && <p className="mt-1 text-xs text-red-600">{errors.request_type.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                    <Textarea
                      id="details"
                      placeholder="Provide all necessary details for your request (e.g., desired country code, voice preference, updated business address, etc.)"
                      className="min-h-[100px]"
                      {...register("details")}
                    />
                    {errors.details && <p className="mt-1 text-xs text-red-600">{errors.details.message}</p>}
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Request History Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Request History</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRequests ? (
                  <p>Loading request history...</p>
                ) : requests.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">You haven't submitted any requests yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {requests.map((req) => (
                      <div key={req.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{req.request_type}</p>
                            <p className="text-xs text-gray-500">Submitted: {formatDate(req.created_at)}</p>
                          </div>
                          <Badge variant={req.status === "Completed" ? "default" : req.status === "Rejected" ? "destructive" : "secondary"}
                                 className={req.status === "Completed" ? "bg-green-100 text-green-800" : ""}
                          >{req.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{req.details}</p>
                        {req.resolution_notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm"><Info className="h-4 w-4 inline-block mr-1 text-gray-500" /> {req.resolution_notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default AIVoiceSettings;
