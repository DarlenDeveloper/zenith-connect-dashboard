import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, PhoneCall, Send, Building, Mail, User } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  company: z.string().min(1, { message: "Company name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactSales = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      message: "I'm interested in the Enterprise plan and would like to discuss pricing and features.",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here you would typically send this data to your backend
      // For now, we'll just simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Show success message
      toast.success("Your request has been sent successfully! Our sales team will contact you soon.", {
        duration: 5000,
      });
      
      // Redirect back to subscription page
      navigate("/subscription");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to send your request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate("/subscription")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
            <h1 className="text-xl font-medium">Contact Sales Team</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-white p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="text-2xl">Enterprise Plan Inquiry</CardTitle>
                <CardDescription>
                  Fill out the form below and our sales team will get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="John Doe" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="john@example.com" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="Acme Corp" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <PhoneCall className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="+1 (555) 123-4567" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your requirements" 
                              className="resize-none min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Please provide details about your business needs and requirements.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <CardFooter className="px-0 pt-2">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" /> Send Inquiry
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default ContactSales;
