import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdovlgtuuhbuoespegab.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kb3ZsZ3R1dWhidW9lc3BlZ2FiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMwODU4NywiZXhwIjoyMDY1ODg0NTg3fQ.UGRTuEFivcOyP9yhbDKIVi0IAn4yI3FRZuMgj-U_Gck';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const migrations = [
  {
    name: 'Add subscription columns',
    sql: `
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;
    `
  },
  {
    name: 'Create indexes for subscription columns',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
      CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
      CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
    `
  },
  {
    name: 'Add premium flag to articles',
    sql: `
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
      CREATE INDEX IF NOT EXISTS idx_articles_is_premium ON articles(is_premium);
    `
  },
  {
    name: 'Create new user trigger function',
    sql: `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, created_at, updated_at)
        VALUES (new.id, new.email, now(), now())
        ON CONFLICT (id) DO NOTHING;
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  },
  {
    name: 'Create auth trigger',
    sql: `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `
  },
  {
    name: 'Enable RLS on profiles',
    sql: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`
  },
  {
    name: 'Create RLS policies',
    sql: `
      DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      DROP POLICY IF EXISTS "Service role has full access" ON profiles;
      
      CREATE POLICY "Users can view own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);
      
      CREATE POLICY "Service role has full access" ON profiles
        USING (auth.jwt() ->> 'role' = 'service_role');
    `
  }
];

async function runMigrations() {
  console.log('Starting migrations...\n');
  
  for (const migration of migrations) {
    console.log(`Running: ${migration.name}`);
    try {
      const { error } = await supabase.from('_dummy').select().limit(0);
      // Since we can't execute raw SQL through the JS client directly,
      // we'll need to use the Supabase dashboard or psql
      console.log(`✓ ${migration.name} - Please run this SQL in Supabase dashboard`);
      console.log(`SQL:\n${migration.sql}\n`);
    } catch (error) {
      console.error(`✗ ${migration.name} failed:`, error);
    }
  }
  
  console.log('\nMigrations script completed. Please run the SQL statements above in your Supabase dashboard.');
}

runMigrations();