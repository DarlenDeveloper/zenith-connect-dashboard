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
          const { customer, meta, tx_ref, amount, currency, id: flutterwave_tx_id } = data;
          const { user_id, plan } = meta || {};
          
          if (!user_id || !plan) {
            console.error("No user_id or plan found in meta data");
            return new Response(
              JSON.stringify({ status: "failed", message: "Invalid metadata" }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
              }
            );
          }

          // --- Calculate subscription period: Exactly 30 days --- 
          // Use Flutterwave's created_at if available and reliable, otherwise use current time
          const startDate = data.created_at ? new Date(data.created_at) : new Date(); 
          const endDate = new Date(startDate); // Create a copy
          endDate.setDate(startDate.getDate() + 30); // Add exactly 30 days

          console.log(`Processing successful payment for user ${user_id}, plan: ${plan}. Subscription active from ${startDate.toISOString()} to ${endDate.toISOString()}`);
          
          // --- Run DB operations concurrently --- 
          const upsertSubscriptionPromise = supabase
            .from('subscriptions')
            .upsert({
              user_id: user_id,
              plan_id: plan,
              status: 'active',
              current_period_start: startDate.toISOString(), // Use calculated start date
              current_period_end: endDate.toISOString(), // Use calculated 30-day end date
              cancel_at_period_end: false,
              metadata: { 
                flutterwave_tx_ref: tx_ref, 
                flutterwave_tx_id: flutterwave_tx_id 
              } 
            }, { onConflict: 'user_id' });

          const insertPaymentPromise = supabase
            .from('payments')
            .insert({
              user_id: user_id,
              flutterwave_tx_id: flutterwave_tx_id,
              flutterwave_tx_ref: tx_ref,
              status: data.status,
              amount: amount,
              currency: currency,
              payment_method: data.payment_type,
              processor_response: data
            });
          
          // Optional profile update
          const updateProfilePromise = supabase
            .from('profiles')
            .update({ has_subscription: true })
            .eq('id', user_id);

          // Wait for all promises to settle
          const results = await Promise.allSettled([
              upsertSubscriptionPromise,
              insertPaymentPromise,
              updateProfilePromise
          ]);

          // Check results and log errors
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              const error = result.reason;
              if (index === 0) console.error("Error upserting subscription:", error);
              if (index === 1) console.error("Error inserting payment record:", error);
              if (index === 2) console.error("Error updating profile:", error);
              // Decide if any error here should cause the webhook to return a failure status
            } else {
              if (index === 0) console.log(`Subscription upserted successfully for user ${user_id}`);
              if (index === 1) console.log(`Payment record inserted successfully for user ${user_id}`);
              if (index === 2) console.log(`Profile updated successfully for user ${user_id}`);
            }
          });
          
          console.log(`Webhook processing complete for charge.completed, user: ${user_id}`);
        }
        break;
      }
      
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
