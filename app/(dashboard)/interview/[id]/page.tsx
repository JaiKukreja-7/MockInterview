"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { updateStreak } from '@/lib/streak';
import Editor from '@monaco-editor/react';
import { Mic, MicOff, Send, Clock, ChevronRight, Loader2, Sparkles, CheckCircle, XCircle, Lightbulb, BookOpen, SkipForward, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function InterviewScreen() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  
  const [submitted, setSubmitted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [generatingQ, setGeneratingQ] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [previousQuestionTexts, setPreviousQuestionTexts] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Load interview metadata
  useEffect(() => {
    async function loadInterview() {
      const { data } = await supabase.from('interviews').select('*').eq('id', id).single();
      if (data) {
        setInterview(data);
      }
      setLoading(false);
    }
    loadInterview();
  }, [id, supabase]);

  // Generate question when needed (initial or when moving to next)
  useEffect(() => {
    if (interview && !generatingQ && currentQuestionIndex >= questions.length) {
      generateNextQuestion();
    }
  }, [interview, currentQuestionIndex, questions.length]);

  // Timer
  useEffect(() => {
    if (loading || submitted || generatingQ) return;
    const interval = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [loading, submitted, generatingQ]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setAnswerText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return alert("Speech recognition not supported in this browser.");
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  // ---- AI: Generate Question ----
  const generateNextQuestion = async () => {
    if (!interview) return;
    setGeneratingQ(true);

    try {
      const res = await fetch('/api/openai-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate_question',
          payload: {
            interview_type: interview.type,
            role: interview.role,
            difficulty: interview.difficulty,
            previous_questions: previousQuestionTexts
          }
        })
      });

      if (!res.ok) throw new Error('Failed to generate question');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const questionText = data.question;

      // Save to Supabase
      const { data: savedQ } = await supabase.from('questions').insert({
        interview_id: id,
        question_text: questionText,
        order_index: questions.length
      }).select().single();

      setQuestions(prev => [...prev, { id: savedQ?.id || `q-${questions.length}`, text: questionText, dbId: savedQ?.id }]);
      setPreviousQuestionTexts(prev => [...prev, questionText]);
    } catch (err: any) {
      console.error('Question generation error:', err);
      showToast('AI is taking a moment, please try again');
      // Fallback question so interview doesn't crash
      const fallbackText = `[AI unavailable] Tell me about your experience with ${interview.type} concepts.`;
      setQuestions(prev => [...prev, { id: `q-${questions.length}`, text: fallbackText }]);
      setPreviousQuestionTexts(prev => [...prev, fallbackText]);
    } finally {
      setGeneratingQ(false);
    }
  };

  // ---- Handle Skip Question ----
  const handleSkip = async () => {
    setSubmitted(true);
    setEvaluating(true);
    const currentQ = questions[currentQuestionIndex];
    
    try {
      if (currentQ.dbId) {
        await supabase.from('questions').update({
          user_answer: null,
          ai_feedback: null,
          score: 0,
          time_spent: timeSpent
        }).eq('id', currentQ.dbId);
      }
      
      showToast('Question skipped');
      setShowSkipConfirm(false);
      setEvaluating(false);
      handleNext();
    } catch (err) {
      console.error('Skip error:', err);
      setEvaluating(false);
    }
  };

  // ---- AI: Evaluate Answer ----
  const handleSubmit = async () => {
    if (isRecording) toggleRecording();
    setSubmitted(true);
    setEvaluating(true);
    setFeedback(null);

    const currentQ = questions[currentQuestionIndex];

    try {
      const res = await fetch('/api/openai-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'evaluate_answer',
          payload: {
            question: currentQ.text,
            answer: answerText,
            interview_type: interview.type,
            role: interview.role,
            difficulty: interview.difficulty
          }
        })
      });

      if (!res.ok) throw new Error('Failed to evaluate answer');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setFeedback(data);

      // Save to Supabase
      if (currentQ.dbId) {
        await supabase.from('questions').update({
          user_answer: answerText,
          ai_feedback: data,
          score: data.score,
          time_spent: timeSpent
        }).eq('id', currentQ.dbId);
      }
    } catch (err: any) {
      console.error('Evaluation error:', err);
      showToast('AI is taking a moment, please try again');
      setFeedback(null);
    } finally {
      setEvaluating(false);
    }
  };

  // ---- Handle Next / Finish ----
  const handleNext = async () => {
    const isLast = currentQuestionIndex >= (interview?.total_questions || 5) - 1;

    if (isLast) {
      // Generate summary and navigate to results
      try {
        // Fetch all questions for this interview
        const { data: allQs } = await supabase
          .from('questions')
          .select('*')
          .eq('interview_id', id)
          .order('order_index');

        const questionsPayload = (allQs || [])
          .filter(q => q.user_answer !== null && q.user_answer !== undefined)
          .map(q => ({
            question_text: q.question_text,
            user_answer: q.user_answer || '',
            score: q.score || 0,
            strengths: q.ai_feedback?.strengths || [],
            weaknesses: q.ai_feedback?.weaknesses || []
          }));

        const res = await fetch('/api/openai-gateway', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'generate_summary',
            payload: {
              role: interview.role,
              interview_type: interview.type,
              difficulty: interview.difficulty,
              questions: questionsPayload
            }
          })
        });

        if (res.ok) {
          const summary = await res.json();
          if (!summary.error) {
            await supabase.from('interviews').update({
              summary: summary,
              total_score: summary.total_score || 0
            }).eq('id', id);
          }
        }

        // Update streak
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await updateStreak(supabase, user.id);
        }
      } catch (err) {
        console.error('Summary generation error:', err);
      }

      router.push(`/results/${id}`);
    } else {
      // Reset all state first
      setAnswerText("");
      setTimeSpent(0);
      setSubmitted(false);
      setFeedback(null);
      setEvaluating(false);
      // Move to next index
      setCurrentQuestionIndex(i => i + 1);
    }
  };



  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!interview) return <div className="p-8 text-center text-red-400">Interview not found.</div>;

  const isCoding = interview.type.toLowerCase().includes('technical') || interview.type.toLowerCase().includes('dsa');
  const totalQ = interview.total_questions || 5;
  const progressPercent = ((currentQuestionIndex) / totalQ) * 100;

  // Score badge color
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 4) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-6 py-3 rounded-xl flex items-center space-x-2 backdrop-blur-sm shadow-lg"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="flex items-center justify-between rounded-2xl p-4 backdrop-blur-sm shrink-0" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', transition: 'var(--transition)' }}>
        <div className="flex-1 max-w-sm">
          <div className="flex justify-between mb-2 text-sm">
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Question {currentQuestionIndex + 1} of {totalQ}</span>
            <span className="text-primary font-medium">{Math.round(((currentQuestionIndex + 1) / totalQ) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: `${progressPercent}%` }}
              animate={{ width: `${((currentQuestionIndex + 1) / totalQ) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
          <Clock className="w-5 h-5" />
          <span className="font-mono font-bold text-lg">
            {Math.floor(timeSpent / 60).toString().padStart(2, '0')}:{(timeSpent % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 pb-4">
        
        <div className="flex flex-col space-y-6 overflow-y-auto pr-2 pb-10 custom-scrollbar relative">
          
          {/* Question Card */}
          <motion.div
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="p-[2px] rounded-3xl bg-[length:200%_200%] bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 shrink-0"
          >
            <div className="bg-surface/95 backdrop-blur-xl rounded-[22px] p-6 lg:p-10 min-h-[250px] shadow-2xl shadow-primary/10 flex items-center">
              {generatingQ ? (
                <div className="flex items-center space-x-3" style={{ color: 'var(--text-secondary)' }}>
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-lg font-medium">Generating question...</span>
                </div>
              ) : (
                <h2 className="text-2xl lg:text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {questions[currentQuestionIndex]?.text}
                </h2>
              )}
            </div>
          </motion.div>

          {/* Feedback Card */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl p-6 relative overflow-hidden shrink-0 mt-6"
                style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', transition: 'var(--transition)' }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/50"></div>
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold">AI Feedback</h3>
                </div>
                
                {evaluating ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Analyzing your answer...</span>
                  </div>
                ) : feedback ? (
                  <div className="space-y-4">
                    {/* Score Badge */}
                    <div className="flex items-center justify-between mb-2 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Score</span>
                      <div className={`text-3xl font-bold px-4 py-1 rounded-xl border ${getScoreColor(feedback.score)}`}>
                        {feedback.score}<span className="text-lg opacity-60">/10</span>
                      </div>
                    </div>

                    {/* Strengths */}
                    {feedback.strengths?.length > 0 && (
                      <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Strengths</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {feedback.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-green-300/80 text-sm flex items-start space-x-2">
                              <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {feedback.weaknesses?.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                          <XCircle className="w-4 h-4" />
                          <span>Areas to Improve</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {feedback.weaknesses.map((w: string, i: number) => (
                            <li key={i} className="text-red-300/80 text-sm flex items-start space-x-2">
                              <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Model Answer */}
                    {feedback.model_answer && (
                      <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>Model Answer</span>
                        </h4>
                        <p className="text-blue-200/80 text-sm leading-relaxed">{feedback.model_answer}</p>
                      </div>
                    )}

                    {/* Tips */}
                    {feedback.tips?.length > 0 && (
                      <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                          <Lightbulb className="w-4 h-4" />
                          <span>Tips</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {feedback.tips.map((t: string, i: number) => (
                            <li key={i} className="text-purple-300/80 text-sm flex items-start space-x-2">
                              <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Feedback failed — allow skip */
                  <div className="text-center py-6 space-y-3">
                    <p style={{ color: 'var(--text-muted)' }}>Could not get AI feedback. You can skip to the next question.</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  {!evaluating && !feedback && (
                    <button 
                      onClick={handleSkip}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
                    >
                      <SkipForward className="w-5 h-5" />
                      <span>Skip</span>
                    </button>
                  )}
                  {!evaluating && (feedback || !feedback) && (
                    <button 
                      onClick={handleNext}
                      disabled={evaluating}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/25 active:scale-[0.98] disabled:opacity-50"
                    >
                      <span>{currentQuestionIndex >= totalQ - 1 ? 'Finish Interview' : 'Next Question'}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Answer Panel */}
        <div className="flex flex-col rounded-3xl overflow-hidden relative shadow-xl" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', transition: 'var(--transition)' }}>
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Your Answer</span>
            
            <button
              onClick={toggleRecording}
              disabled={submitted}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                isRecording 
                  ? 'bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse' 
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              } ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Listening...' : 'Voice Type'}</span>
            </button>
          </div>

          <div className="flex-1 relative bg-black/20">
            {isCoding ? (
              <div className="h-[400px] lg:h-full w-full">
                <div className="hidden md:block h-full">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    value={answerText}
                    onChange={(val) => setAnswerText(val || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 15,
                      padding: { top: 16 },
                      readOnly: submitted,
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
                <div className="md:hidden h-full">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    disabled={submitted}
                    className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono text-sm disabled:opacity-50"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder="Write your code here..."
                  />
                </div>
              </div>
            ) : (
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                disabled={submitted}
                className="w-full h-[300px] lg:h-full p-6 bg-transparent resize-none focus:outline-none text-lg disabled:opacity-50"
                style={{ color: 'var(--text-primary)' }}
                placeholder="Type your answer here or use voice input..."
              />
            )}
            
          {submitted && <div className="absolute inset-0 bg-surface/30 backdrop-blur-[2px] z-10"></div>}
          </div>

          {!submitted && (
            <div className="p-4 backdrop-blur-md flex items-center justify-between gap-4" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)' }}>
              <div className="relative">
                <button 
                  onClick={() => setShowSkipConfirm(true)}
                  className="px-5 py-3.5 rounded-xl border-[0.5px] border-white/15 bg-transparent text-white/70 hover:bg-white/5 transition-all font-medium whitespace-nowrap"
                >
                  Skip Question &rarr;
                </button>
                {showSkipConfirm && (
                  <div className="absolute bottom-[calc(100%+12px)] left-0 w-64 p-4 rounded-xl bg-surface border border-white/10 shadow-xl z-50">
                    <p className="text-sm text-white/90 mb-3 font-medium">Skip this question? It will be marked as unanswered and scored 0.</p>
                    <div className="flex space-x-2">
                      <button onClick={handleSkip} className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors">Yes, skip</button>
                      <button onClick={() => setShowSkipConfirm(false)} className="flex-1 py-2 rounded-lg bg-transparent border border-white/10 hover:bg-white/5 text-xs font-bold transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={handleSubmit}
                disabled={(!answerText.trim() && !isRecording) || generatingQ}
                className="flex-1 flex items-center justify-center space-x-2 bg-primary text-white hover:bg-primary/90 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                <span>Submit Answer</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
