import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Local dev: Save to file
    if (process.env.NODE_ENV === 'development') {
      const responseWithTimestamp = {
        ...data,
        created_at: new Date().toISOString(),
      };
      await fs.appendFile('responses.json', JSON.stringify(responseWithTimestamp) + '\n');
    } else {
      // Production: Save to Vercel Postgres
      await sql`
        INSERT INTO responses (
          language, name, state, lga, ward, age, gender,
          knows_romeo, knows_muyideen, knows_abdulrasheed,
          heard_savewell, residence, phone, created_at
        ) VALUES (
          ${data.language}, ${data.name}, ${data.state}, ${data.lga},
          ${data.ward}, ${data.age}, ${data.gender},
          ${data.knowsRomeo}, ${data.knowsMuyideen}, ${data.knowsAbdulrasheed},
          ${data.heardSavewell}, ${data.residence}, ${data.phone}, NOW()
        )
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}