
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Get environment variables
const FLUTTERWAVE_PUBLIC_KEY = Deno.env.get("FLUTTERWAVE_PUBLIC_KEY") || "";
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
    // Get the JWT from the request headers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Get the user from the JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token or user not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Parse the request body
    const { plan, amount, successUrl, cancelUrl, userId, userEmail } = await req.json();
    
    if (!plan || !amount) {
      return new Response(
        JSON.stringify({ error: "Plan and amount are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Check if the user already has an active subscription using our SQL function
    const { data: isActive, error: subscriptionError } = await supabase.rpc(
      'is_subscription_active',
      { user_uuid: user.id }
    );

    if (subscriptionError) {
      console.error("Error checking subscription status:", subscriptionError);
    } else if (isActive) {
      // User already has an active subscription, redirect to dashboard
      return new Response(
        JSON.stringify({ 
          paymentLink: successUrl || `${req.headers.get("origin")}/dashboard?subscription=existing` 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Generate reference ID
    const txRef = `FLW-${userId.substring(0, 8)}-${Date.now()}`;
    
    // Create the Flutterwave payment request
    const flutterwavePayload = {
      tx_ref: txRef,
      amount: amount,
      currency: "USD",
      payment_options: "card",
      redirect_url: successUrl,
      customer: {
        email: userEmail,
        name: userEmail.split('@')[0],
      },
      meta: {
        user_id: userId,
        plan: plan,
      },
      customizations: {
        title: "Premium Subscription",
        description: `${plan} Plan Subscription`,
        logo: "https://assets.piedpiper.com/logo.png", // Replace with your logo URL
      },
    };

    // Make request to Flutterwave API
    const flutterwaveResponse = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
        body: JSON.stringify(flutterwavePayload),
      }
    );

    const flutterwaveData = await flutterwaveResponse.json();

    if (!flutterwaveResponse.ok) {
      console.error("Flutterwave API error:", flutterwaveData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create payment link",
          details: flutterwaveData
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Store transaction reference in database for verification later
    await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        status: 'pending',
        current_period_start: new Date(),
        current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
        stripe_subscription_id: txRef, // Using txRef as subscription id for now
      }, {
        onConflict: 'user_id'
      });

    console.log("Payment link created:", flutterwaveData.data.link);

    // Return the payment link
    return new Response(
      JSON.stringify({ paymentLink: flutterwaveData.data.link }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating payment link:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        details: error
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
