import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Lightbulb, Plus, Info, Star, Sparkles } from "lucide-react";
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
  request_type: z.string().min(1, { message: "Feature type is required" }),
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

const FeatureRequests = () => {
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
      toast.error("You must be logged in to submit feature requests.");
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
      <div className="flex flex-col h-full px-4 py-4 md:px-6 lg:px-8">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-4 sm:px-6 justify-between rounded-t-lg">
          <div className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-medium">Feature Requests</h1>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-4 sm:p-6 rounded-b-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* New Request Form Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
                  Submit a New Feature Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="request_type" className="block text-sm font-medium text-gray-700 mb-1">Feature Type</label>
                    <Select 
                      onValueChange={(value) => setValue('request_type', value, { shouldValidate: true })}
                    >
                      <SelectTrigger id="request_type">
                        <SelectValue placeholder="Select feature type..." />
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
                      placeholder="Describe your feature request in detail. What problem would it solve? How would it improve your experience?"
                      className="min-h-[120px]"
                      {...register("details")}
                    />
                    {errors.details && <p className="mt-1 text-xs text-red-600">{errors.details.message}</p>}
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Request History Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-blue-600" />
                  Your Feature Request History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRequests ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8 border border-dashed rounded-lg">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>You haven't submitted any feature requests yet.</p>
                    <p className="mt-1">Have an idea to improve the platform? We'd love to hear it!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {requests.map((req) => (
                      <div key={req.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{req.request_type}</p>
                            <p className="text-xs text-gray-500">Submitted: {formatDate(req.created_at)}</p>
                          </div>
                          <Badge 
                            variant={
                              req.status === "Completed" ? "default" : 
                              req.status === "Rejected" ? "destructive" : 
                              req.status === "In Progress" ? "secondary" : 
                              "outline"
                            }
                            className={
                              req.status === "Completed" ? "bg-green-100 text-green-800 border-green-200" : 
                              req.status === "In Progress" ? "bg-blue-100 text-blue-800 border-blue-200" :
                              req.status === "Rejected" ? "bg-red-100 text-red-800 border-red-200" :
                              "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{req.details}</p>
                        {req.resolution_notes && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                            <Info className="h-4 w-4 inline-block mr-1 text-blue-600" /> 
                            <span className="font-medium">Response: </span>
                            {req.resolution_notes}
                          </div>
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

export default FeatureRequests;
