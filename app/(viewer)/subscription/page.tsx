'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { getStripeJs } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/client';

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, stripe_customer_id')
          .eq('id', user.id)
          .single();
        
        setSubscription(profile);
      }
    };
    
    checkAuth();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await getStripeJs();

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe error:', error);
        alert('決済処理中にエラーが発生しました。');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = subscription?.subscription_status === 'active';

  return (
    <div className="container max-w-6xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">TodaiMedia Premium</h1>
        <p className="text-xl text-muted-foreground">
          すべてのプレミアム記事にアクセスして、より深い学びを
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>無料プラン</CardTitle>
            <CardDescription>基本的な記事へのアクセス</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">¥0<span className="text-lg font-normal">/月</span></div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                一般公開記事の閲覧
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                記事へのコメント
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4" />
                プレミアム記事は月3本まで
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled={!isSubscribed}>
              {isSubscribed ? '現在のプラン' : '無料プラン'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>プレミアムプラン</CardTitle>
            <CardDescription>すべての機能にフルアクセス</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">¥1,480<span className="text-lg font-normal">/月</span></div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                すべての記事へのアクセス
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                プレミアム記事無制限
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                限定セミナーへの参加
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                広告なし
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isSubscribed ? (
              <Button 
                className="w-full" 
                onClick={handleManageSubscription}
                disabled={loading}
              >
                {loading ? '処理中...' : 'プランを管理'}
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleSubscribe}
                disabled={loading || !user}
              >
                {loading ? '処理中...' : user ? 'プレミアムに登録' : 'ログインして登録'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}