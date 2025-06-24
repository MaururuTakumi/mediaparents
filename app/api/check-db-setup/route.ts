import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  try {
    // Check profiles table structure
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);
    
    // Check articles table for is_premium column
    const { data: articleCheck, error: articleError } = await supabase
      .from('articles')
      .select('is_premium')
      .limit(0);
    
    const status = {
      profilesTableExists: !profileError,
      articlesHasPremium: !articleError,
      errors: {
        profiles: profileError?.message,
        articles: articleError?.message
      }
    };
    
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: 'Database check failed', details: error }, { status: 500 });
  }
}