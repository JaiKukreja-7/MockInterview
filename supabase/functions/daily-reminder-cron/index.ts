// supabase/functions/daily-reminder-cron/index.ts
// Supabase Edge Function — Daily Streak Reminder Cron
// Deploy with: supabase functions deploy daily-reminder-cron
//
// Schedule in Supabase SQL Editor (runs daily at 6pm IST / 12:30 UTC):
//
// SELECT cron.schedule(
//   'daily-reminder',
//   '30 12 * * *',
//   $$
//   SELECT net.http_post(
//     url := 'https://zwovsxtmzrrhalrklxyv.supabase.co/functions/v1/daily-reminder-cron',
//     headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
//   )
//   $$
// );

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find users who haven't practiced in 24 hours but have a streak > 0
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: usersToRemind, error: queryError } = await supabase
      .from('users')
      .select('id, name, email, streak_count, last_active')
      .lt('last_active', yesterday)
      .gt('streak_count', 0)
      .eq('is_guest', false)
      .eq('email_notifications', true)
      .not('email', 'is', null)

    if (queryError) {
      console.error('Query error:', queryError)
      return new Response(
        JSON.stringify({ error: queryError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let sentCount = 0
    let failCount = 0

    // Send reminder to each user
    for (const user of usersToRemind || []) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'daily_reminder',
            to: user.email,
            data: {
              name: user.name,
              streak: user.streak_count,
              user_id: user.id,
            },
          }),
        })

        if (response.ok) {
          sentCount++
        } else {
          failCount++
          console.error(`Failed to send reminder to ${user.email}:`, await response.text())
        }
      } catch (err) {
        failCount++
        console.error(`Error sending reminder to ${user.email}:`, err)
      }
    }

    console.log(`Daily reminders: ${sentCount} sent, ${failCount} failed, ${usersToRemind?.length || 0} total`)

    return new Response(
      JSON.stringify({
        success: true,
        total: usersToRemind?.length || 0,
        sent: sentCount,
        failed: failCount,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('daily-reminder-cron error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
