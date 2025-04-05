
import { supabase } from "@/integrations/supabase/client";

// Function to redirect to Flutterwave payment
export const redirectToFlutterwavePayment = async (plan: string, amount: number) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to subscribe');
    }

    console.log(`Initiating Flutterwave payment for plan: ${plan}, amount: ${amount}`);
    
    // Get the current origin for proper redirection
    const origin = window.location.origin;
    
    // Create Flutterwave payment session
    const response = await supabase.functions.invoke('create-flutterwave-payment', {
      body: {
        plan,
        amount,
        currency: "UGX", // Changed from USD to UGX
        successUrl: `${origin}/dashboard?subscription=success`,
        cancelUrl: `${origin}/subscription`,
        userId: user.id,
        userEmail: user.email
      }
    });
    
    if (response.error) {
      console.error('Error from payment endpoint:', response.error);
      return { error: new Error(response.error.message || 'Failed to initiate payment') };
    }
    
    const { paymentLink } = response.data;
    
    if (!paymentLink) {
      console.error('No payment link received from API');
      return { error: new Error('No payment link received') };
    }
    
    console.log('Redirecting to payment page:', paymentLink);
    
    // Redirect to payment page
    window.location.href = paymentLink;
    return { success: true };
    
  } catch (error) {
    console.error('Payment error:', error);
    return { error };
  }
};

// Function to get current subscription status
export const getSubscriptionStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { hasSubscription: false };

    // Use our SQL function to check if subscription is active
    const { data: isActive, error: functionError } = await supabase.rpc(
      'is_subscription_active',
      { user_uuid: user.id }
    );
    
    if (functionError) {
      console.error('Error calling subscription function:', functionError);
      
      // Fallback to checking the profile directly
      const { data, error } = await supabase
        .from('profiles')
        .select('has_subscription')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      return { 
        hasSubscription: data?.has_subscription || false 
      };
    }
    
    // If the function says the subscription is active but profile doesn't reflect it,
    // update the profile
    if (isActive) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('has_subscription')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileData && !profileData.has_subscription) {
        await supabase
          .from('profiles')
          .update({ has_subscription: true })
          .eq('id', user.id);
      }
    }
    
    return { hasSubscription: isActive };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { hasSubscription: false, error };
  }
};
