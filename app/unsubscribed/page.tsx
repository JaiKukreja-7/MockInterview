"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function UnsubscribedContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const isError = status === 'error';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#050508',
      fontFamily: 'Arial, Helvetica, sans-serif',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#0A0A0F',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '48px 32px',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
        }}>
          {isError ? '⚠️' : '✅'}
        </div>

        {/* Title */}
        <h1 style={{
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 12px',
        }}>
          {isError
            ? 'Something went wrong'
            : 'You have been unsubscribed'}
        </h1>

        {/* Description */}
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '15px',
          lineHeight: 1.6,
          margin: '0 0 32px',
        }}>
          {isError
            ? 'We couldn\'t process your unsubscribe request. Please try again or contact support.'
            : 'You will no longer receive email notifications from MockPrep. You can re-enable them anytime from your account settings.'}
        </p>

        {/* CTA */}
        <Link
          href="/dashboard"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px 28px',
            borderRadius: '10px',
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribedPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#050508',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
        Loading...
      </div>
    }>
      <UnsubscribedContent />
    </Suspense>
  );
}
