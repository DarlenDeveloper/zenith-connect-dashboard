

import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "./env";
import { supabase } from "@/integrations/supabase/client";

// Initialize Stripe
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Function to redirect to Stripe Checkout
export const redirectToCheckout = async (priceId: string) => {
  try {
    const stripe = await getStripe();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to subscribe');
    }

    console.log(`Initiating checkout with price ID: ${priceId}`);
    
    // Create Stripe checkout session
    const response = await fetch('https://hytudwviatqbtwnlqsdl.supabase.co/functions/v1/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        priceId,
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/subscription`,
        clientReferenceId: user.id,
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from checkout endpoint:', errorData);
      return { error: new Error(errorData.error || 'Failed to initiate checkout') };
    }
    
    const { url } = await response.json();
    
    // Redirect to checkout
    window.location.href = url;
    return { success: true };
    
  } catch (error) {
    console.error('Checkout error:', error);
    return { error };
  }
};

// Function to get current subscription status
export const getSubscriptionStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { hasSubscription: false };

    // Query the profiles table for subscription status
    const { data, error } = await supabase
      .from('profiles')
      .select('has_subscription')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    
    return { 
      hasSubscription: data?.has_subscription || false 
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { hasSubscription: false, error };
  }
};

