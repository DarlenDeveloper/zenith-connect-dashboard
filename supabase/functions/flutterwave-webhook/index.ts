
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Get environment variables
const FLUTTERWAVE_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY") || "";
const FLUTTERWAVE_ENCRYPTION_KEY = Deno.env.get("FLUTTERWAVE_ENCRYPTION_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse webhook payload
    const payload = await req.json();
    console.log("Received webhook payload:", JSON.stringify(payload));

    // Verify that the webhook is coming from Flutterwave
    const hash = req.headers.get("verif-hash");
    
    // This is a test setup - in production, you should have a secret hash 
    // configured in your Flutterwave dashboard and verify it here
    if (!hash || hash !== FLUTTERWAVE_ENCRYPTION_KEY) {
      console.error("Webhook verification failed");
      return new Response(
        JSON.stringify({ status: "failed", message: "Verification failed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Process different webhook events
    const { event, data } = payload;

    switch (event) {
      case "charge.completed": {
        if (data.status === "successful") {
          const { customer, meta, tx_ref, amount } = data;
          const { user_id, plan } = meta || {};
          
          if (!user_id) {
            console.error("No user_id found in meta data");
            return new Response(
              JSON.stringify({ status: "failed", message: "Invalid metadata" }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
              }
            );
          }

          // Calculate end date (1 month from now)
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);

          // Update subscription status in database
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: user_id,
              status: 'active',
              current_period_start: startDate.toISOString(),
              current_period_end: endDate.toISOString(),
              stripe_subscription_id: tx_ref, // Using tx_ref as the ID
            }, {
              onConflict: 'user_id'
            });

          if (subscriptionError) {
            console.error("Error updating subscription:", subscriptionError);
          }

          // Update user profile has_subscription status
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ has_subscription: true })
            .eq('id', user_id);

          if (profileError) {
            console.error("Error updating profile:", profileError);
          }

          console.log(`Payment successful for user ${user_id}, plan: ${plan}`);
        }
        break;
      }
      
      case "transfer.completed":
      case "transfer.failed":
      default:
        // Handle other events or ignore them
        console.log(`Received unhandled event: ${event}`);
    }

    return new Response(
      JSON.stringify({ status: "success", message: "Webhook processed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: error.message || "An unexpected error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
