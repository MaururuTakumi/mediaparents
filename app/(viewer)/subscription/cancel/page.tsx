'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="container max-w-4xl py-12">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <CardTitle>決済がキャンセルされました</CardTitle>
          <CardDescription>
            決済処理がキャンセルされました。プレミアムプランへの登録をご希望の場合は、もう一度お試しください。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button onClick={() => router.push('/subscription')} className="w-full">
            プランを見る
          </Button>
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
            ホームに戻る
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}