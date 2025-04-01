import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@12.4.0";

// Get environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const STRIPE_WEBHOOK_SECRET = "whsec_aYiiZDcyCYAFUZIa1puCrVIcUY7pAxnJ";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  try {
    // Get the stripe signature from the request
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe signature", { status: 400 });
    }

    // Get the raw request body
    const body = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body,  signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    console.log(`Handling ${event.type} event`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const clientReferenceId = session.client_reference_id; // This is the user ID

        if (!clientReferenceId) {
          console.error("No client_reference_id in session");
          return new Response("No client_reference_id in session", { status: 400 });
        }

        console.log(`Checkout completed for user: ${clientReferenceId}`);

        // Get subscription details to get the end period
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Update customer_subscriptions table
        const { error: subscriptionError } = await supabase
          .from("customer_subscriptions")
          .upsert({
            user_id: clientReferenceId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            plan_id: subscription.items.data[0].price.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

        if (subscriptionError) {
          console.error("Error updating subscription:", subscriptionError);
          return new Response(`Error updating subscription: ${subscriptionError.message}`, { status: 500 });
        }

        // Update profiles.has_subscription to true
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ has_subscription: true })
          .eq("id", clientReferenceId);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          return new Response(`Error updating profile: ${profileError.message}`, { status: 500 });
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Find the user associated with this customer
        const { data: customerData, error: customerError } = await supabase
          .from("customer_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (customerError || !customerData) {
          console.error("Error finding customer:", customerError);
          return new Response(`Error finding customer: ${customerError?.message || "Customer not found"}`, { status: 400 });
        }

        const userId = customerData.user_id;

        // Update subscription in database
        const { error: updateError } = await supabase
          .from("customer_subscriptions")
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          return new Response(`Error updating subscription: ${updateError.message}`, { status: 500 });
        }

        // If subscription is no longer active, update profile
        if (subscription.status !== "active" && subscription.status !== "trialing") {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ has_subscription: false })
            .eq("id", userId);

          if (profileError) {
            console.error("Error updating profile:", profileError);
            return new Response(`Error updating profile: ${profileError.message}`, { status: 500 });
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Find the user associated with this customer
        const { data: customerData, error: customerError } = await supabase
          .from("customer_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (customerError || !customerData) {
          console.error("Error finding customer:", customerError);
          return new Response(`Error finding customer: ${customerError?.message || "Customer not found"}`, { status: 400 });
        }

        const userId = customerData.user_id;

        // Update subscription status
        const { error: updateError } = await supabase
          .from("customer_subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_customer_id", customerId);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          return new Response(`Error updating subscription: ${updateError.message}`, { status: 500 });
        }

        // Update profile subscription status
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ has_subscription: false })
          .eq("id", userId);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          return new Response(`Error updating profile: ${profileError.message}`, { status: 500 });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 500 });
  }
});
