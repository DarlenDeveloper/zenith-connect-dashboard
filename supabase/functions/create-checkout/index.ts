
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@12.4.0";

// Get environment variables
const STRIPE_SECRET_KEY = "sk_test_51R8SCVPEXvlHYAZ3cAzinkmoat6YUimFQAbdwRoOjoJigVvjhh6yqULQB1dydP3lPVk9higueiQfEKER9bu8RYb000ehROKWCy";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

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
    const { priceId, successUrl, cancelUrl, clientReferenceId } = await req.json();
    
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Price ID is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Check if the user already has a customer ID in Stripe
    const { data: customerData } = await supabase
      .from("customer_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = customerData?.stripe_customer_id;

    // If no customer ID exists, look up the customer by email or create a new one
    if (!customerId) {
      const { data: customers } = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.length > 0) {
        customerId = customers[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        });
        customerId = newCustomer.id;
      }
    }

    console.log(`Creating checkout session for price ID: ${priceId}, customer: ${customerId}`);

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${req.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/subscription`,
      client_reference_id: clientReferenceId || user.id,
    });

    // Return the session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    // Check if this is a Stripe error with more details
    const errorMessage = error.type === 'StripeInvalidRequestError' 
      ? `Stripe error: ${error.message}` 
      : error.message;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.type === 'StripeInvalidRequestError' ? error : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
