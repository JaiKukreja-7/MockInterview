// lib/send-email.ts
// Client-side utility for sending emails via Supabase Edge Function.
// All email sending goes through the Edge Function — API keys are never exposed to the frontend.

import { createClient } from '@/utils/supabase/client'

interface InterviewCompleteEmailData {
  name: string
  score: number
  role: string
  difficulty: string
  type: string
  top_strength?: string
  top_weakness?: string
  improvement_areas?: string[]
  date: string
  user_id: string
}

interface SendEmailParams {
  type: 'interview_complete' | 'daily_reminder'
  to: string
  data: InterviewCompleteEmailData | Record<string, unknown>
}

/**
 * Sends an email by invoking the Supabase `send-email` Edge Function.
 * 
 * This function is designed to NEVER throw — email failures are logged
 * but do not block the user or crash the UI.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Add the current app URL so email links work correctly
    const appUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://mockprep.vercel.app'

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        ...params,
        data: {
          ...params.data,
          app_url: appUrl,
        },
      },
    })

    if (error) {
      console.error('[sendEmail] Edge function error:', error)
      return false
    }

    if (data?.skipped) {
      console.log(`[sendEmail] Skipped: ${data.reason}`)
      return true // Not an error — just skipped
    }

    return data?.success === true
  } catch (err) {
    // Never let email failures crash the app
    console.error('[sendEmail] Unexpected error:', err)
    return false
  }
}

/**
 * Send the interview complete email.
 * Call this from the results page after the interview data has loaded.
 */
export async function sendInterviewCompleteEmail(params: {
  email: string
  name: string
  userId: string
  score: number
  role: string
  difficulty: string
  interviewType: string
  topStrength?: string
  topWeakness?: string
  improvementAreas?: string[]
}): Promise<boolean> {
  // Skip if no email (guest users)
  if (!params.email) {
    return false
  }

  return sendEmail({
    type: 'interview_complete',
    to: params.email,
    data: {
      name: params.name,
      score: params.score,
      role: params.role,
      difficulty: params.difficulty,
      type: params.interviewType,
      top_strength: params.topStrength || '',
      top_weakness: params.topWeakness || '',
      improvement_areas: params.improvementAreas || [],
      user_id: params.userId,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    },
  })
}
