"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ArrowLeft, Check, Play } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 1, title: 'Interview Type' },
  { id: 2, title: 'Target Role' },
  { id: 3, title: 'Difficulty' },
  { id: 4, title: 'Duration' },
  { id: 5, title: 'Summary' }
];

const TYPES = ['Technical DSA', 'System Design', 'HR & Behavioural', 'Full Round'];
const ROLES = ['SDE Intern', 'SDE-1', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'Product Manager'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [5, 10, 15];

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    type: '',
    role: '',
    difficulty: '',
    questions: 0
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const isStepValid = () => {
    if (step === 1) return !!selections.type;
    if (step === 2) return !!selections.role;
    if (step === 3) return !!selections.difficulty;
    if (step === 4) return !!selections.questions;
    return true;
  };

  const startInterview = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Ensure user profile exists in users table
    await supabase.from('users').upsert({
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    }, { onConflict: 'id' });

    const { data, error } = await supabase.from('interviews').insert({
      user_id: user.id,
      type: selections.type,
      role: selections.role,
      difficulty: selections.difficulty,
      total_questions: selections.questions,
      total_score: 0
    }).select().single();

    if (data && !error) {
      router.push(`/interview/${data.id}`);
    } else {
      console.error('Failed to create interview:', error);
      alert('Failed to start interview: ' + (error?.message || 'Unknown error'));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8 relative px-4 sm:px-0">
        <div className="absolute left-[5%] sm:left-[10%] top-1/2 -translate-y-1/2 w-[90%] sm:w-[80%] h-1 bg-white/10 rounded-full z-0"></div>
        <div 
          className="absolute left-[5%] sm:left-[10%] top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * (typeof window !== 'undefined' && window.innerWidth < 640 ? 90 : 80)}%` }}
        ></div>
        
        {STEPS.map((s) => (
          <div key={s.id} className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
              step > s.id ? 'bg-primary text-white border-2 border-primary shadow-[0_0_15px_rgba(124,58,237,0.5)]' : 
              step === s.id ? 'bg-surface border-2 border-primary text-primary shadow-[0_0_10px_rgba(124,58,237,0.3)]' : 
              'bg-surface border-2 border-white/20 text-white/40'
            }`}>
              {step > s.id ? <Check className="w-5 h-5" /> : s.id}
            </div>
            <span className={`absolute top-12 text-xs font-medium whitespace-nowrap hidden sm:block transition-colors duration-300 ${
              step >= s.id ? 'text-white/80' : 'text-white/40'
            }`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-16 sm:mt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <Card>
                <CardHeader><CardTitle className="text-center text-xl sm:text-2xl">What type of interview do you want to practice?</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {TYPES.map(type => (
                    <div 
                      key={type}
                      onClick={() => setSelections({...selections, type})}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center text-center ${
                        selections.type === type 
                          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(124,58,237,0.15)] scale-[1.02]' 
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <h3 className="font-semibold text-lg">{type}</h3>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader><CardTitle className="text-center text-xl sm:text-2xl">Select your target role</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                  {ROLES.map(role => (
                    <div 
                      key={role}
                      onClick={() => setSelections({...selections, role})}
                      className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all flex items-center justify-center ${
                        selections.role === role 
                          ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(124,58,237,0.1)] scale-[1.02]' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <h3 className="font-medium">{role}</h3>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader><CardTitle className="text-center text-xl sm:text-2xl">Choose difficulty level</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {DIFFICULTIES.map(diff => (
                    <div 
                      key={diff}
                      onClick={() => setSelections({...selections, difficulty: diff})}
                      className={`p-6 rounded-xl border-2 cursor-pointer text-center transition-all ${
                        selections.difficulty === diff 
                          ? diff === 'Easy' ? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.15)] scale-[1.02]' :
                            diff === 'Medium' ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]' :
                            'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)] scale-[1.02]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <h3 className="font-semibold text-lg">{diff}</h3>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardHeader><CardTitle className="text-center text-xl sm:text-2xl">How many questions?</CardTitle></CardHeader>
                <CardContent className="flex justify-center space-x-6 pt-8 pb-4">
                  {QUESTION_COUNTS.map(num => (
                    <div 
                      key={num}
                      onClick={() => setSelections({...selections, questions: num})}
                      className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 cursor-pointer transition-all ${
                        selections.questions === num 
                          ? 'border-primary bg-primary/20 scale-110 shadow-[0_0_20px_rgba(124,58,237,0.3)]' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-3xl font-bold">{num}</span>
                      <span className="text-xs text-white/60">Q&apos;s</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {step === 5 && (
              <Card className="border-primary/50 shadow-[0_0_30px_rgba(124,58,237,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                    <Check className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl">Ready to begin?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-4 bg-surface/50 p-6 rounded-xl border border-white/5">
                    <div>
                      <p className="text-sm text-white/40 mb-1">Type</p>
                      <p className="font-medium text-lg">{selections.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/40 mb-1">Role</p>
                      <p className="font-medium text-lg">{selections.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/40 mb-1">Difficulty</p>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selections.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        selections.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {selections.difficulty}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-white/40 mb-1">Questions</p>
                      <p className="font-medium text-lg">{selections.questions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-12 flex justify-between items-center px-2">
          <button 
            onClick={handleBack}
            disabled={step === 1 || loading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'bg-surface hover:bg-white/10 text-white border border-white/10'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          {step < 5 ? (
            <button 
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center space-x-2 px-8 py-3 bg-white text-black hover:bg-white/90 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <span>Continue</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={startInterview}
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-3 bg-primary text-white hover:bg-primary/90 rounded-xl font-medium transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              ) : (
                <Play className="w-5 h-5 fill-white" />
              )}
              <span>{loading ? 'Setting up...' : 'Start Interview'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
