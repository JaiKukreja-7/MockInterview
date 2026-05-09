// app/api/unsubscribe/route.ts
// API route to handle email unsubscribe requests.
// Sets email_notifications = FALSE for the given user ID.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('id')

  if (!userId) {
    return NextResponse.redirect(new URL('/unsubscribed?status=error', request.url))
  }

  try {
    // Use service role to bypass RLS — unsubscribe should work even if user is not logged in
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from('users')
      .update({ email_notifications: false })
      .eq('id', userId)

    if (error) {
      console.error('Unsubscribe error:', error)
      return NextResponse.redirect(new URL('/unsubscribed?status=error', request.url))
    }

    return NextResponse.redirect(new URL('/unsubscribed?status=success', request.url))
  } catch (err) {
    console.error('Unsubscribe unexpected error:', err)
    return NextResponse.redirect(new URL('/unsubscribed?status=error', request.url))
  }
}
