'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // You could verify the session here if needed
      setLoading(false);
    } else {
      router.push('/subscription');
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center">
          <p>処理中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <CardTitle>登録が完了しました！</CardTitle>
          <CardDescription>
            TodaiMedia Premiumへようこそ。すべてのプレミアム記事にアクセスできるようになりました。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push('/articles')} className="w-full">
            記事を見る
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-4xl py-12">
        <div className="text-center">
          <p>読み込み中...</p>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}