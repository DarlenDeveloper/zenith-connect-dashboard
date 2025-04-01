
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Stripe secret and webhook secret from environment
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecretKey || !stripeWebhookSecret) {
      throw new Error("Missing required environment variables");
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get the raw request body for webhook verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object, supabase);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object, supabase);
        break;
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, stripe, supabase);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Handle subscription created or updated
async function handleSubscriptionChange(subscription: any, supabase: any) {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const planId = subscription.items.data[0]?.price.id;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  // Find the user associated with this Stripe customer
  const { data: customerData, error: customerError } = await supabase
    .from("customer_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (customerError && customerError.code !== "PGRST116") {
    // PGRST116 is "no rows returned" error
    console.error("Error finding customer:", customerError);
    return;
  }

  let userId = customerData?.user_id;

  // If no existing record found, try to find the user from checkout session metadata
  if (!userId && subscription.metadata?.userId) {
    userId = subscription.metadata.userId;
  }

  if (!userId) {
    console.error("Could not identify user for subscription", subscriptionId);
    return;
  }

  // Update or insert subscription record
  const { error: upsertError } = await supabase
    .from("customer_subscriptions")
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status,
      plan_id: planId,
      current_period_end,
      updated_at: new Date().toISOString(),
    });

  if (upsertError) {
    console.error("Error updating subscription:", upsertError);
    return;
  }

  // Update user profile has_subscription flag
  const hasActiveSubscription = status === "active" || status === "trialing";
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ has_subscription: hasActiveSubscription })
    .eq("id", userId);

  if (profileError) {
    console.error("Error updating profile subscription status:", profileError);
  }
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(subscription: any, supabase: any) {
  const subscriptionId = subscription.id;

  // Find the subscription
  const { data, error: findError } = await supabase
    .from("customer_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (findError) {
    console.error("Error finding subscription:", findError);
    return;
  }

  const userId = data.user_id;

  // Update subscription status
  const { error: updateError } = await supabase
    .from("customer_subscriptions")
    .update({
      status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (updateError) {
    console.error("Error updating subscription:", updateError);
    return;
  }

  // Update user profile subscription flag
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ has_subscription: false })
    .eq("id", userId);

  if (profileError) {
    console.error("Error updating profile subscription status:", profileError);
  }
}

// Handle checkout session completed
async function handleCheckoutCompleted(session: any, stripe: any, supabase: any) {
  // Only process subscription checkouts
  if (session.mode !== "subscription") return;

  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const userId = session.client_reference_id || session.metadata?.userId;

  if (!userId) {
    console.error("No user ID found in checkout session");
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const planId = subscription.items.data[0]?.price.id;

  // Add user's subscription to database
  const { error } = await supabase.from("customer_subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status: subscription.status,
    plan_id: planId,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating subscription record:", error);
    return;
  }

  // Update user profile subscription flag
  const hasActiveSubscription = subscription.status === "active" || subscription.status === "trialing";
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ has_subscription: hasActiveSubscription })
    .eq("id", userId);

  if (profileError) {
    console.error("Error updating profile subscription status:", profileError);
  }
}
