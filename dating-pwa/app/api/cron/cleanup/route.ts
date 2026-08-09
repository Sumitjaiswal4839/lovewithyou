import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  // Security check: Only allow requests with a specific Cron Secret (useful for Vercel Cron)
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Delete users inactive for > 6 months
    const { data, error, count } = await supabase
      .from('profiles')
      .delete({ count: 'exact' })
      .lt('last_active', sixMonthsAgo.toISOString());

    if (error) {
      console.error('Data cleanup failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Data cleanup successful. Deleted ${count || 0} inactive profiles.`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
