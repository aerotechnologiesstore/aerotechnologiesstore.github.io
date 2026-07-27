import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const rawGroqKey = (process.env.NEXT_PUBLIC_GROQ_API_KEY_REV || process.env.GROQ_API_KEY_REV || '')
      .split('').reverse().join('');
    
    if (!rawGroqKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: rawGroqKey });
    
    const body = await req.json();
    const { messages, model, temperature, max_tokens, response_format } = body;

    const completion = await groq.chat.completions.create({
      messages,
      model: model || 'llama-3.1-8b-instant',
      temperature: temperature ?? 0.7,
      max_tokens,
      response_format,
    });

    return NextResponse.json(completion);
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
