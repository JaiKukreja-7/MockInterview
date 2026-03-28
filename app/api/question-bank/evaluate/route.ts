import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question_text, user_answer, category, difficulty, expected_answer } = body;

    if (!process.env.GROKAI_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are a senior technical interviewer evaluating a candidate's answer to a ${category} question at ${difficulty} difficulty. Analyze the answer carefully and return ONLY a valid JSON object with exactly this structure, no extra text, no markdown code fences: { "score": number between 0 and 10, "strengths": string[] (2-3 specific things done well), "weaknesses": string[] (2-3 specific things missing or wrong), "model_answer": string (a concise ideal answer in 3-5 sentences), "tips": string[] (2-3 actionable improvement tips) }`;

    const userPrompt = `Question: ${question_text}\n\nCandidate's Answer: ${user_answer}\n\nExpected Answer (for reference): ${expected_answer || 'Not provided'}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROKAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.4,
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
    const raw = data.choices?.[0]?.message?.content?.trim() || '';

    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      // Retry once
      const retryResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROKAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          temperature: 0.3,
          messages: [
            { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Return ONLY valid JSON.' },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const retryRaw = retryData.choices?.[0]?.message?.content?.trim() || '';
        const cleaned = retryRaw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      }

      return NextResponse.json({ score: 0, error: 'AI feedback unavailable for this attempt' }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Question Bank Evaluate Error:', error);
    return NextResponse.json(
      { score: 0, error: 'AI feedback unavailable for this attempt' },
      { status: 200 }
    );
  }
}
