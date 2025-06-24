import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';

export async function getUserSubscriptionStatus(userId: string) {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, stripe_subscription_id, subscription_status')
    .eq('id', userId)
    .single();

  if (!profile?.stripe_subscription_id) {
    return { isActive: false, status: null };
  }

  // Verify with Stripe for real-time status
  try {
    const subscription = await stripe.subscriptions.retrieve(
      profile.stripe_subscription_id
    );

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    
    // Update database if status changed
    if (subscription.status !== profile.subscription_status) {
      await supabase
        .from('profiles')
        .update({ subscription_status: subscription.status })
        .eq('id', userId);
    }

    return { isActive, status: subscription.status, subscription };
  } catch (error) {
    console.error('Error fetching subscription from Stripe:', error);
    return { isActive: profile.subscription_status === 'active', status: profile.subscription_status };
  }
}

export async function createOrRetrieveCustomer(userId: string, email: string) {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
    },
  });

  // Save to database
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}