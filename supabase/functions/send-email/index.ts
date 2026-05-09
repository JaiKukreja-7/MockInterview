// supabase/functions/send-email/index.ts
// Supabase Edge Function for sending emails via Resend
// Deploy with: supabase functions deploy send-email
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxxx

import { Resend } from 'npm:resend'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

// ──────────────────────────────────────────────
// Email Template: Interview Complete
// ──────────────────────────────────────────────
function interviewCompleteTemplate(data: {
  name: string
  score: number
  role: string
  difficulty: string
  type: string
  top_strength: string
  top_weakness: string
  improvement_areas: string[]
  date: string
  user_id: string
  app_url: string
}) {
  const scoreColor =
    data.score >= 70 ? '#10B981' : data.score >= 40 ? '#F59E0B' : '#EF4444'
  const scoreLabel =
    data.score >= 80
      ? 'Excellent!'
      : data.score >= 60
        ? 'Great Job!'
        : data.score >= 40
          ? 'Good Effort!'
          : 'Keep Practicing!'

  const improvementItems = (data.improvement_areas || [])
    .map(
      (area, i) =>
        `<tr><td style="padding: 6px 0; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.5;"><span style="color: #A78BFA; font-weight: bold; margin-right: 8px;">${i + 1}.</span>${area}</td></tr>`
    )
    .join('')

  const unsubscribeUrl = `${data.app_url}/api/unsubscribe?id=${data.user_id}`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Interview Results</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050508; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #0A0A0F; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3AED, #6D28D9); padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; color: #ffffff; font-weight: 800; letter-spacing: 0.5px;">MockPrep</h1>
              <p style="margin: 6px 0 0; font-size: 14px; color: rgba(255,255,255,0.75);">Your interview results are ready</p>
            </td>
          </tr>

          <!-- Score -->
          <tr>
            <td style="padding: 36px 24px 20px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td align="center">
                    <div style="width: 90px; height: 90px; border-radius: 50%; background-color: ${scoreColor}; color: #ffffff; font-size: 32px; font-weight: 800; line-height: 90px; text-align: center; margin: 0 auto 16px;">
                      ${data.score}
                    </div>
                  </td>
                </tr>
              </table>
              <h2 style="margin: 0 0 6px; font-size: 22px; color: #ffffff; font-weight: 700;">${scoreLabel}</h2>
              <p style="margin: 0 0 4px; font-size: 18px; color: rgba(255,255,255,0.9);">Hey ${data.name || 'there'}! 👋</p>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.5);">
                You completed a <strong style="color: rgba(255,255,255,0.7);">${data.difficulty}</strong> 
                <strong style="color: rgba(255,255,255,0.7);">${data.type}</strong> interview for 
                <strong style="color: rgba(255,255,255,0.7);">${data.role}</strong>
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.35);">${data.date}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="height: 1px; background-color: rgba(255,255,255,0.06);"></div>
            </td>
          </tr>

          <!-- Strengths & Weaknesses -->
          <tr>
            <td style="padding: 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${data.top_strength ? `
                  <td width="48%" valign="top" style="padding-right: 8px;">
                    <div style="background-color: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 10px; padding: 16px;">
                      <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #10B981; text-transform: uppercase; letter-spacing: 1px;">🟢 Top Strength</p>
                      <p style="margin: 0; font-size: 13px; color: rgba(16,185,129,0.85); line-height: 1.4;">${data.top_strength}</p>
                    </div>
                  </td>
                  ` : ''}
                  ${data.top_weakness ? `
                  <td width="48%" valign="top" style="padding-left: 8px;">
                    <div style="background-color: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 16px;">
                      <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #EF4444; text-transform: uppercase; letter-spacing: 1px;">🔴 Top Weakness</p>
                      <p style="margin: 0; font-size: 13px; color: rgba(239,68,68,0.85); line-height: 1.4;">${data.top_weakness}</p>
                    </div>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Improvement Areas -->
          ${improvementItems ? `
          <tr>
            <td style="padding: 0 24px 24px;">
              <div style="background-color: rgba(124,58,237,0.06); border: 1px solid rgba(124,58,237,0.15); border-radius: 10px; padding: 16px;">
                <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; color: #A78BFA; text-transform: uppercase; letter-spacing: 1px;">📝 Areas to Improve</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${improvementItems}
                </table>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 8px 24px 32px; text-align: center;">
              <a href="${data.app_url}/setup" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #6D28D9); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 10px; letter-spacing: 0.3px;">
                Practice Again →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
              <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255,255,255,0.3);">
                You're receiving this because you have an account on MockPrep.
              </p>
              <a href="${unsubscribeUrl}" style="font-size: 12px; color: rgba(255,255,255,0.4); text-decoration: underline;">
                Unsubscribe from notifications
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ──────────────────────────────────────────────
// Email Template: Daily Reminder
// ──────────────────────────────────────────────
function dailyReminderTemplate(data: {
  name: string
  streak: number
  user_id: string
  app_url: string
}) {
  const unsubscribeUrl = `${data.app_url}/api/unsubscribe?id=${data.user_id}`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your streak is at risk!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050508; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #0A0A0F; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3AED, #6D28D9); padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; color: #ffffff; font-weight: 800; letter-spacing: 0.5px;">MockPrep</h1>
              <p style="margin: 6px 0 0; font-size: 14px; color: rgba(255,255,255,0.75);">Daily practice reminder</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <p style="margin: 0 0 16px; font-size: 56px; line-height: 1;">🔥</p>
              <h2 style="margin: 0 0 12px; font-size: 24px; color: #ffffff; font-weight: 800;">
                Your ${data.streak}-day streak is at risk!
              </h2>
              <p style="margin: 0 0 28px; font-size: 15px; color: rgba(255,255,255,0.55); line-height: 1.5;">
                Hey ${data.name || 'there'}, you haven't practiced today.<br>
                Complete one interview to keep your streak alive.
              </p>
              <a href="${data.app_url}/setup" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #6D28D9); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 40px; border-radius: 10px; letter-spacing: 0.3px;">
                Practice Now →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
              <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255,255,255,0.3);">
                You're receiving this because you have an account on MockPrep.
              </p>
              <a href="${unsubscribeUrl}" style="font-size: 12px; color: rgba(255,255,255,0.4); text-decoration: underline;">
                Unsubscribe from notifications
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ──────────────────────────────────────────────
// Edge Function Handler
// ──────────────────────────────────────────────
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { type, to, data } = await req.json()

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, to' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has email_notifications enabled
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (data.user_id) {
      const { data: userData } = await supabase
        .from('users')
        .select('email_notifications, is_guest')
        .eq('id', data.user_id)
        .single()

      // Skip if user is a guest or has unsubscribed
      if (userData?.is_guest === true) {
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: 'guest_user' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }

      if (userData?.email_notifications === false) {
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: 'unsubscribed' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Determine app URL for links in emails
    const appUrl = data.app_url || Deno.env.get('APP_URL') || 'https://mockprep.vercel.app'

    if (type === 'interview_complete') {
      const { error } = await resend.emails.send({
        from: 'MockPrep <noreply@resend.dev>',
        to,
        subject: `Your interview results are in — ${data.score}/100`,
        html: interviewCompleteTemplate({ ...data, app_url: appUrl }),
      })

      if (error) {
        console.error('Resend error (interview_complete):', error)
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    if (type === 'daily_reminder') {
      const { error } = await resend.emails.send({
        from: 'MockPrep <noreply@resend.dev>',
        to,
        subject: `Your streak is at risk 🔥 — practice today`,
        html: dailyReminderTemplate({ ...data, app_url: appUrl }),
      })

      if (error) {
        console.error('Resend error (daily_reminder):', error)
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('send-email function error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
