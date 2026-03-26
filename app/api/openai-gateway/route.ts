import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'llama-3.1-8b-instant';

async function callAI(systemPrompt: string, userPrompt: string, temperature = 0.7): Promise<string> {
  const apiKey = process.env.GROKAI_API_KEY;
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Groq API Error:', response.status, err);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

async function generateQuestion(payload: any) {
  const { interview_type, role, difficulty, previous_questions } = payload;
  const prevList = previous_questions?.length
    ? `\nPrevious questions (do NOT repeat any of these):\n${previous_questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  const systemPrompt = 'You are a senior technical interviewer at a top tech company. Generate exactly one interview question based on the provided role, difficulty, and type. The question must be different from the previous questions listed. Return ONLY the question text, nothing else — no numbering, no preamble.';
  const userPrompt = `Interview type: ${interview_type}\nRole: ${role}\nDifficulty: ${difficulty}${prevList}`;

  const question = await callAI(systemPrompt, userPrompt, 0.8);
  return { question: question || 'Describe a challenging technical problem you solved recently.' };
}

async function evaluateAnswer(payload: any) {
  const { question, answer, interview_type, role, difficulty } = payload;

  const systemPrompt = 'You are a senior technical interviewer evaluating a candidate\'s answer. Analyze the answer carefully and return ONLY a valid JSON object with exactly this structure, no extra text, no markdown code fences: { "score": number between 0 and 10, "strengths": string[] (2-3 specific things done well), "weaknesses": string[] (2-3 specific things missing or wrong), "model_answer": string (a concise ideal answer in 3-5 sentences), "tips": string[] (2-3 actionable improvement tips) }';
  const userPrompt = `Interview type: ${interview_type}\nRole: ${role}\nDifficulty: ${difficulty}\n\nQuestion: ${question}\n\nCandidate's answer: ${answer}`;

  let parsed = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt = attempt === 0 ? systemPrompt : systemPrompt + '\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY a valid JSON object, no markdown, no code fences, no extra text.';
    const raw = await callAI(prompt, userPrompt, 0.4);
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
      break;
    } catch {
      if (attempt === 1) throw new Error('Failed to parse AI feedback JSON after retry');
    }
  }
  return parsed;
}

async function generateSummary(payload: any) {
  const { role, interview_type, difficulty, questions } = payload;

  const systemPrompt = 'You are a senior technical interviewer writing a post-interview performance review. Based on the full interview session provided, return ONLY a valid JSON object with exactly this structure, no markdown code fences: { "total_score": number (average of all question scores scaled to 100), "overall_feedback": string (2-3 sentence honest performance summary), "top_strength": string (single best thing about the candidate), "top_weakness": string (single biggest area to improve), "improvement_areas": string[] (exactly 3 specific actionable things to work on), "skill_scores": { "problem_solving": number, "communication": number, "technical_knowledge": number, "code_quality": number, "system_thinking": number, "behavioural": number } where each is a score out of 10 }';

  const questionsText = questions.map((q: any, i: number) =>
    `Q${i + 1}: ${q.question_text}\nAnswer: ${q.user_answer}\nScore: ${q.score}/10\nStrengths: ${q.strengths?.join(', ') || 'N/A'}\nWeaknesses: ${q.weaknesses?.join(', ') || 'N/A'}`
  ).join('\n\n');

  const userPrompt = `Role: ${role}\nInterview type: ${interview_type}\nDifficulty: ${difficulty}\n\nFull interview session:\n${questionsText}`;

  let parsed = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt = attempt === 0 ? systemPrompt : systemPrompt + '\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY a valid JSON object, no markdown, no code fences, no extra text.';
    const raw = await callAI(prompt, userPrompt, 0.5);
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
      break;
    } catch {
      if (attempt === 1) throw new Error('Failed to parse AI summary JSON after retry');
    }
  }
  return parsed;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    if (!process.env.GROKAI_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured. Add GROKAI_API_KEY to .env.local' }, { status: 500 });
    }

    let result;
    switch (type) {
      case 'generate_question':
        result = await generateQuestion(payload);
        break;
      case 'evaluate_answer':
        result = await evaluateAnswer(payload);
        break;
      case 'generate_summary':
        result = await generateSummary(payload);
        break;
      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Gateway Error:', error);
    return NextResponse.json(
      { error: error.message || 'AI is taking a moment, please try again' },
      { status: 500 }
    );
  }
}
