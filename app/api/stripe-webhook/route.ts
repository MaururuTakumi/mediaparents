import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (userId && session.subscription) {
          // プロフィールを更新
          await supabase
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_status: 'active',
              subscription_start_date: new Date().toISOString(),
            })
            .eq('id', userId);

          // サブスクリプションテーブルに記録
          const subscriptionResponse = await stripe.subscriptions.retrieve(session.subscription as string);
          const subscription = subscriptionResponse as Stripe.Subscription;
          await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: session.customer as string,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              plan_price: subscription.items.data[0].price.unit_amount! / 100,
            });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // プロフィールを更新
        await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
          })
          .eq('stripe_subscription_id', subscription.id);

        // サブスクリプションテーブルを更新
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // プロフィールを更新
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_end_date: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        // サブスクリプションテーブルを更新
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          await supabase
            .from('profiles')
            .update({
              last_payment_date: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'past_due',
            })
            .eq('stripe_subscription_id', invoice.subscription);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}