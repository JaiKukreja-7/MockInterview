import { createClient } from '@/utils/supabase/client';

// ============================================================
// Types
// ============================================================
export interface CompanyQuestion {
  id: string;
  company: string;
  company_logo_url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'DSA' | 'System Design' | 'HR' | 'Frontend' | 'Backend';
  topic: string;
  question_text: string;
  expected_answer: string;
  hints: string[];
  frequency: 'Very Common' | 'Common' | 'Rare';
  last_seen: string;
  upvotes: number;
  is_verified: boolean;
  created_at: string;
}

export interface QuestionAttempt {
  id: string;
  user_id: string;
  question_id: string;
  user_answer: string;
  ai_score: number;
  ai_feedback: any;
  hints_used: number;
  time_spent: number;
  created_at: string;
}

export interface QuestionFilters {
  search?: string;
  companies?: string[];
  difficulties?: string[];
  categories?: string[];
  topics?: string[];
  frequencies?: string[];
  status?: 'all' | 'attempted' | 'unattempted' | 'bookmarked';
  sortBy?: 'recent' | 'upvotes' | 'difficulty_asc' | 'difficulty_desc';
  page?: number;
  pageSize?: number;
}

export interface UserQuestionStats {
  totalQuestions: number;
  attempted: number;
  bookmarked: number;
  accuracy: number;
}

// ============================================================
// Fetch Questions
// ============================================================
export async function fetchQuestions(filters: QuestionFilters = {}) {
  const supabase = createClient();
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('company_questions').select('*', { count: 'exact' });

  // Search
  if (filters.search) {
    query = query.ilike('question_text', `%${filters.search}%`);
  }

  // Company filter
  if (filters.companies && filters.companies.length > 0) {
    query = query.in('company', filters.companies);
  }

  // Difficulty filter
  if (filters.difficulties && filters.difficulties.length > 0) {
    query = query.in('difficulty', filters.difficulties);
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    query = query.in('category', filters.categories);
  }

  // Topic filter
  if (filters.topics && filters.topics.length > 0) {
    query = query.in('topic', filters.topics);
  }

  // Frequency filter
  if (filters.frequencies && filters.frequencies.length > 0) {
    query = query.in('frequency', filters.frequencies);
  }

  // Sorting
  switch (filters.sortBy) {
    case 'upvotes':
      query = query.order('upvotes', { ascending: false });
      break;
    case 'difficulty_asc':
      query = query.order('difficulty', { ascending: true });
      break;
    case 'difficulty_desc':
      query = query.order('difficulty', { ascending: false });
      break;
    case 'recent':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  query = query.range(from, to);

  const { data, count, error } = await query;
  return { data: data as CompanyQuestion[] | null, count, error };
}

export async function fetchQuestionById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('company_questions')
    .select('*')
    .eq('id', id)
    .single();
  return { data: data as CompanyQuestion | null, error };
}

export async function fetchQuestionsByCompany(company: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('company_questions')
    .select('*')
    .eq('company', company)
    .order('created_at', { ascending: false });
  return { data: data as CompanyQuestion[] | null, error };
}

// ============================================================
// Bookmarks
// ============================================================
export async function getUserBookmarks(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_bookmarks')
    .select('question_id')
    .eq('user_id', userId);
  return { data: data?.map(b => b.question_id) || [], error };
}

export async function toggleBookmark(userId: string, questionId: string, isBookmarked: boolean) {
  const supabase = createClient();
  if (isBookmarked) {
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('question_id', questionId);
    return { success: !error, error };
  } else {
    const { error } = await supabase
      .from('user_bookmarks')
      .insert({ user_id: userId, question_id: questionId });
    return { success: !error, error };
  }
}

// ============================================================
// Upvotes
// ============================================================
export async function getUserUpvotes(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('question_upvotes')
    .select('question_id')
    .eq('user_id', userId);
  return { data: data?.map(u => u.question_id) || [], error };
}

export async function toggleUpvote(userId: string, questionId: string, isUpvoted: boolean) {
  const supabase = createClient();
  if (isUpvoted) {
    // Remove upvote
    const { error: delErr } = await supabase
      .from('question_upvotes')
      .delete()
      .eq('user_id', userId)
      .eq('question_id', questionId);
    if (!delErr) {
      await supabase.rpc('decrement_upvote', { qid: questionId }).catch(() => {
        // Fallback: manual decrement
        supabase.from('company_questions').select('upvotes').eq('id', questionId).single()
          .then(({ data }) => {
            if (data) supabase.from('company_questions').update({ upvotes: Math.max(0, (data.upvotes || 0) - 1) }).eq('id', questionId);
          });
      });
    }
    return { success: !delErr, error: delErr };
  } else {
    // Add upvote
    const { error: insErr } = await supabase
      .from('question_upvotes')
      .insert({ user_id: userId, question_id: questionId });
    if (!insErr) {
      await supabase.rpc('increment_upvote', { qid: questionId }).catch(() => {
        supabase.from('company_questions').select('upvotes').eq('id', questionId).single()
          .then(({ data }) => {
            if (data) supabase.from('company_questions').update({ upvotes: (data.upvotes || 0) + 1 }).eq('id', questionId);
          });
      });
    }
    return { success: !insErr, error: insErr };
  }
}

// ============================================================
// Attempts
// ============================================================
export async function getUserAttempts(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_question_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data as QuestionAttempt[] | null, error };
}

export async function getAttemptedQuestionIds(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_question_attempts')
    .select('question_id')
    .eq('user_id', userId);
  const ids = [...new Set(data?.map(a => a.question_id) || [])];
  return { data: ids, error };
}

export async function saveAttempt(attempt: {
  user_id: string;
  question_id: string;
  user_answer: string;
  ai_score: number;
  ai_feedback: any;
  hints_used: number;
  time_spent: number;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_question_attempts')
    .insert(attempt)
    .select()
    .single();
  return { data, error };
}

// ============================================================
// Stats
// ============================================================
export async function getUserQuestionStats(userId: string): Promise<UserQuestionStats> {
  const supabase = createClient();

  // Total questions count
  const { count: totalQuestions } = await supabase
    .from('company_questions')
    .select('*', { count: 'exact', head: true });

  // Attempted questions
  const { data: attempts } = await supabase
    .from('user_question_attempts')
    .select('question_id, ai_score')
    .eq('user_id', userId);

  const attemptedIds = new Set(attempts?.map(a => a.question_id) || []);
  const attempted = attemptedIds.size;

  // Bookmarked count
  const { count: bookmarked } = await supabase
    .from('user_bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Accuracy (average score / 10 * 100)
  let accuracy = 0;
  if (attempts && attempts.length > 0) {
    const totalScore = attempts.reduce((sum, a) => sum + (a.ai_score || 0), 0);
    accuracy = Math.round((totalScore / attempts.length / 10) * 100);
  }

  return {
    totalQuestions: totalQuestions || 0,
    attempted,
    bookmarked: bookmarked || 0,
    accuracy,
  };
}

// ============================================================
// Topics list
// ============================================================
export const ALL_TOPICS = [
  'Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming',
  'Linked Lists', 'Stacks', 'Queues', 'Heaps', 'Hashing',
  'Sorting', 'Recursion', 'Matrix', 'OOP', 'OS', 'DBMS',
  'Networking', 'Concurrency', 'Database', 'API Design',
  'Microservices', 'Caching', 'Distributed Systems', 'System Design',
  'React', 'JavaScript', 'CSS', 'Performance', 'Behavioral',
];

export const ALL_CATEGORIES = ['DSA', 'System Design', 'HR', 'Frontend', 'Backend'];
export const ALL_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
export const ALL_FREQUENCIES = ['Very Common', 'Common', 'Rare'];
