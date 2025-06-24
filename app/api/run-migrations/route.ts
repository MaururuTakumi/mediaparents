import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const migrationSQL = `
-- 2.1 サブスクリプション関連のカラムを追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- パフォーマンス向上のためのインデックス作成
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- 2.2 記事のプレミアムフラグを追加
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_articles_is_premium ON articles(is_premium);
`;

const triggerSQL = `
-- 2.3 新規ユーザー用のトリガーを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

const rlsSQL = `
-- 2.4 RLSポリシーの設定
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;

-- 新しいポリシーを作成
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role has full access" ON profiles
  USING (auth.jwt() ->> 'role' = 'service_role');
`;

export async function GET() {
  try {
    // Use the service role client for admin operations
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const results: {
      step1: string | null;
      step2: string | null;
      step3: string | null;
      errors: { step: string; error: string }[];
    } = {
      step1: null,
      step2: null,
      step3: null,
      errors: []
    };
    
    // Step 1: Add columns and indexes
    try {
      const { error } = await adminSupabase.rpc('exec_sql', { sql: migrationSQL });
      if (error) {
        results.errors.push({ step: 'columns_and_indexes', error: error.message });
      } else {
        results.step1 = 'Columns and indexes created successfully';
      }
    } catch (e: any) {
      results.errors.push({ step: 'columns_and_indexes', error: e.message });
    }
    
    // Step 2: Create trigger
    try {
      const { error } = await adminSupabase.rpc('exec_sql', { sql: triggerSQL });
      if (error) {
        results.errors.push({ step: 'trigger', error: error.message });
      } else {
        results.step2 = 'Trigger created successfully';
      }
    } catch (e: any) {
      results.errors.push({ step: 'trigger', error: e.message });
    }
    
    // Step 3: Set up RLS
    try {
      const { error } = await adminSupabase.rpc('exec_sql', { sql: rlsSQL });
      if (error) {
        results.errors.push({ step: 'rls', error: error.message });
      } else {
        results.step3 = 'RLS policies created successfully';
      }
    } catch (e: any) {
      results.errors.push({ step: 'rls', error: e.message });
    }
    
    return NextResponse.json({
      success: results.errors.length === 0,
      results,
      message: results.errors.length === 0 ? 'All migrations completed successfully' : 'Some migrations failed'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: 'Migration failed', 
      details: error.message 
    }, { status: 500 });
  }
}