
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "./env";

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
  const stripe = await getStripe();
  
  // Create Stripe checkout session
  const { error } = await stripe.redirectToCheckout({
    lineItems: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/subscription`,
  });
  
  // If there is an error, alert the user
  if (error) {
    console.log('Error redirecting to checkout:', error);
    return { error };
  }
};
