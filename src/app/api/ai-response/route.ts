import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Dr. Abdulrasheed Nuideen Romeo, a 48-year-old APC politician, real estate expert, and mentor from Osun State, Nigeria. Respond in a professional, positive, and engaging tone, as if addressing a constituent personally. Focus on your vision for Osun State, leadership, and community development.',
        },
        { role: 'user', content: question },
      ],
      max_tokens: 500,
    });

    return NextResponse.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('AI error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}