"use client";

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Shield } from 'lucide-react';

interface GuestUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuestUpgradeModal({ isOpen, onClose }: GuestUpgradeModalProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined' || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box' as const,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#13131A',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '420px',
              position: 'relative',
              zIndex: 100000,
              boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(124,58,237,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Gradient accent at top */}
            <div style={{
              height: '3px',
              background: 'linear-gradient(90deg, #7C3AED, #06b6d4, #ec4899)',
              width: '100%',
            }} />

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div style={{ padding: '40px 32px 32px' }}>
              {/* Icon */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15))',
                border: '0.5px solid rgba(124,58,237,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Sparkles size={26} style={{ color: '#7C3AED' }} />
              </div>

              <h2 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
              }}>
                Create a free account
              </h2>

              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                margin: '0 0 28px',
                lineHeight: 1.6,
              }}>
                Sign up to unlock interviews, bookmarks, analytics and more — completely free.
              </p>

              {/* Features list */}
              <div style={{ marginBottom: '28px' }}>
                {['Mock interviews with AI feedback', 'Bookmark & track questions', 'Performance analytics dashboard'].map((feature, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 0',
                  }}>
                    <Shield size={14} style={{ color: '#7C3AED', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Primary CTA */}
              <button
                onClick={() => router.push('/login')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#7C3AED',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '10px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#6D28D9'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#7C3AED'; }}
              >
                Sign up free →
              </button>

              {/* Secondary */}
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.4)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
