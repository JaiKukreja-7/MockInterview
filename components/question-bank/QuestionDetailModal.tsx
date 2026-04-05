"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Mic, MicOff, Send, Eye, EyeOff, ThumbsUp, ThumbsDown, AlertTriangle, Loader2, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { saveAttempt, type CompanyQuestion } from '@/lib/question-bank';
import { useTheme } from '@/components/ThemeProvider';

// Fix 2 — Monaco with SSR disabled and explicit loading state
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '400px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(255,255,255,0.3)',
      fontSize: '13px',
    }}>
      Loading editor...
    </div>
  )
});

interface QuestionDetailModalProps {
  question: CompanyQuestion;
  onClose: () => void;
}

export default function QuestionDetailModal({ question, onClose }: QuestionDetailModalProps) {
  // Fix 3 — null guard
  if (!question) return null;

  const [activeTab, setActiveTab] = useState<'practice' | 'hints' | 'solution'>('practice');
  const [answerText, setAnswerText] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRecording, setIsRecording] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const recognitionRef = useRef<any>(null);
  const supabase = createClient();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isCoding = ['DSA', 'Frontend', 'Backend'].includes(question.category);
  const isSystemDesign = question.category === 'System Design';
  const hints = Array.isArray(question.hints) ? question.hints : [];

  // Timer
  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  // Speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }
        if (transcript) setAnswerText(prev => prev + (prev ? ' ' : '') + transcript);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) recognitionRef.current.stop();
    else recognitionRef.current.start();
    setIsRecording(!isRecording);
  };

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 4000); };

  const handleSubmit = async () => {
    if (isRecording) toggleRecording();
    setSubmitted(true);
    setEvaluating(true);

    try {
      const res = await fetch('/api/openai-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'evaluate_answer',
          payload: {
            question: question.question_text,
            answer: answerText,
            interview_type: question.category,
            role: 'Software Engineer',
            difficulty: question.difficulty
          }
        })
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFeedback(data);
      setSolutionUnlocked(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await saveAttempt({
          user_id: user.id,
          question_id: question.id,
          user_answer: answerText,
          ai_score: data.score || 0,
          ai_feedback: data,
          hints_used: hintsRevealed,
          time_spent: timeSpent,
        });
      }
    } catch (err) {
      showToast('AI feedback unavailable. Attempt saved with score 0.');
      setFeedback({ score: 0, error: true });
      setSolutionUnlocked(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await saveAttempt({ user_id: user.id, question_id: question.id, user_answer: answerText, ai_score: 0, ai_feedback: null, hints_used: hintsRevealed, time_spent: timeSpent });
      }
    } finally {
      setEvaluating(false);
    }
  };

  const skipAndReveal = () => { setSolutionUnlocked(true); setActiveTab('solution'); };

  const scoreColor = (s: number) => s >= 7 ? 'text-green-400' : s >= 4 ? 'text-amber-400' : 'text-red-400';
  const diffColor = question.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : question.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20';

  const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
  ];

  // Don't render portal until document is available
  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : '20px',
        boxSizing: 'border-box' as const,
      }}
    >
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 100001 }}
            className="bg-amber-500/20 border border-amber-500/30 text-amber-400 px-6 py-3 rounded-xl flex items-center space-x-2 backdrop-blur-sm"
          >
            <AlertTriangle className="w-5 h-5" /><span className="font-medium text-sm">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#13131A',
          border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: isMobile ? '16px 16px 0 0' : '16px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: isMobile ? '90vh' : '85vh',
          overflowY: 'auto' as const,
          position: 'relative',
          zIndex: 100000,
          boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(124,58,237,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center space-x-3">
            <img
              src={`https://www.google.com/s2/favicons?domain=${question.company.toLowerCase().replace(/\s+/g, '')}.com&sz=64`}
              alt={question.company}
              width={32}
              height={32}
              loading="lazy"
              style={{ borderRadius: '4px', objectFit: 'contain', background: 'white', padding: '2px' }}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${question.company}&background=7C3AED&color=fff&size=64&bold=true&length=2`
              }}
            />
            <div>
              <span className="text-sm font-semibold text-white">{question.company}</span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${diffColor}`}>{question.difficulty}</span>
                <span className="text-[11px] text-white/40">{question.category} · {question.topic}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="font-mono text-sm font-bold text-white">
                {Math.floor(timeSpent / 60).toString().padStart(2, '0')}:{(timeSpent % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-white/60" /></button>
          </div>
        </div>

        {/* Question */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-white/90 font-medium leading-relaxed">{question.question_text}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {(['practice', 'hints', 'solution'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px 0',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'capitalize',
                transition: 'all 0.2s',
                borderBottom: activeTab === tab ? '2px solid #7C3AED' : '2px solid transparent',
                color: activeTab === tab ? '#7C3AED' : 'rgba(255,255,255,0.4)',
                background: 'transparent',
                cursor: 'pointer',
              }}>
              {tab}{tab === 'hints' ? ` (${hintsRevealed}/${hints.length})` : ''}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '0' }}>
          {activeTab === 'practice' && (
            <div>
              {isCoding ? (
                <div>
                  {/* Language bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                    <select value={language} onChange={e => setLanguage(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', color: 'white', outline: 'none' }}>
                      {LANGUAGES.map(l => <option key={l.value} value={l.value} style={{ background: '#1a1a2e' }}>{l.label}</option>)}
                    </select>
                    <button onClick={toggleRecording} disabled={submitted}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 text-white/60 hover:bg-white/10'} ${submitted ? 'opacity-50' : ''}`}>
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isRecording ? 'Listening...' : 'Voice'}</span>
                    </button>
                  </div>
                  {/* Monaco Editor */}
                  <div style={{ width: '100%', height: '380px', overflow: 'hidden' }}>
                    <MonacoEditor
                      height="380px"
                      language={language}
                      theme="vs-dark"
                      value={answerText}
                      onChange={val => setAnswerText(val || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 12, bottom: 12 },
                        readOnly: submitted,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={toggleRecording} disabled={submitted}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 text-white/60 hover:bg-white/10'} ${submitted ? 'opacity-50' : ''}`}>
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isRecording ? 'Listening...' : 'Voice'}</span>
                    </button>
                  </div>
                  <textarea value={answerText} onChange={e => setAnswerText(e.target.value)} disabled={submitted}
                    style={{ flex: 1, width: '100%', padding: '20px 24px', background: 'transparent', resize: 'none', outline: 'none', color: 'rgba(255,255,255,0.9)', fontSize: '16px', minHeight: '320px', border: 'none', opacity: submitted ? 0.5 : 1 }}
                    placeholder={isSystemDesign ? 'Describe your system design approach...' : 'Type your answer here...'} />
                </div>
              )}

              {/* Submit / Feedback */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.01)' }}>
                {!submitted ? (
                  <button onClick={handleSubmit} disabled={!answerText.trim()}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', color: 'black', padding: '12px', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: !answerText.trim() ? 0.5 : 1, transition: 'all 0.2s' }}>
                    <span>Submit Answer</span><Send className="w-4 h-4" />
                  </button>
                ) : evaluating ? (
                  <div className="flex items-center justify-center space-x-3 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-white/60 font-medium">Analyzing your answer...</span>
                  </div>
                ) : feedback ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Your Score</span>
                      <span className={`text-2xl font-bold ${scoreColor(feedback.score)}`}>{feedback.score}<span className="text-sm opacity-60">/10</span></span>
                    </div>
                    {feedback.strengths?.length > 0 && (
                      <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3">
                        <p className="text-xs font-bold text-green-400 uppercase mb-1.5 flex items-center space-x-1"><CheckCircle className="w-3.5 h-3.5" /><span>Strengths</span></p>
                        <ul className="space-y-1">{feedback.strengths.map((s: string, i: number) => <li key={i} className="text-green-300/80 text-xs">• {s}</li>)}</ul>
                      </div>
                    )}
                    {feedback.weaknesses?.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                        <p className="text-xs font-bold text-red-400 uppercase mb-1.5 flex items-center space-x-1"><XCircle className="w-3.5 h-3.5" /><span>To Improve</span></p>
                        <ul className="space-y-1">{feedback.weaknesses.map((w: string, i: number) => <li key={i} className="text-red-300/80 text-xs">• {w}</li>)}</ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {activeTab === 'hints' && (
            <div style={{ padding: '20px 24px' }} className="space-y-4">
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80">Try without hints first — revealing hints affects your practice score.</p>
              </div>
              {hints.map((hint, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  {i < hintsRevealed ? (
                    <div>
                      <p className="text-xs font-bold text-primary uppercase mb-2 flex items-center space-x-1"><Lightbulb className="w-3.5 h-3.5" /><span>Hint {i + 1}</span></p>
                      <p className="text-sm text-white/80 leading-relaxed">{hint}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => { if (i === hintsRevealed) setHintsRevealed(i + 1); }}
                      disabled={i > hintsRevealed}
                      className={`w-full text-center py-2 text-sm font-medium transition-all ${i === hintsRevealed ? 'text-primary hover:text-primary/80 cursor-pointer' : 'text-white/20 cursor-not-allowed'}`}>
                      {i === hintsRevealed ? `Reveal Hint ${i + 1}` : `Reveal Hint ${i} first`}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'solution' && (
            <div style={{ padding: '20px 24px' }}>
              {solutionUnlocked ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <h4 className="text-sm font-bold text-primary uppercase mb-3">Model Answer</h4>
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{question.expected_answer}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-4 py-3">
                    <span className="text-sm text-white/40">Was this helpful?</span>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 text-white/40 hover:text-green-400 transition-all"><ThumbsUp className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"><ThumbsDown className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center"><EyeOff className="w-8 h-8 text-white/20" /></div>
                  <p className="text-white/50">Submit your answer first to unlock the solution.</p>
                  <button onClick={skipAndReveal} className="text-sm text-primary hover:text-primary/80 font-medium underline underline-offset-4">Skip and reveal solution</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
