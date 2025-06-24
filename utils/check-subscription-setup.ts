import { createClient } from '@/utils/supabase/server';

export async function checkSubscriptionSetup() {
  const supabase = await createClient();
  
  try {
    // Check if subscription columns exist
    const { data, error } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id, subscription_status')
      .limit(1);
    
    if (error) {
      console.error('Subscription columns not found:', error);
      return false;
    }
    
    console.log('Subscription setup verified');
    return true;
  } catch (error) {
    console.error('Error checking subscription setup:', error);
    return false;
  }
}