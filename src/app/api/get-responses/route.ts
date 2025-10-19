
// src/app/api/get-responses/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { sql } from '@vercel/postgres';

// 1. define the shape of a response
type ResponseRow = Record<string, unknown>; // or your exact DB-row type

export async function GET() {
  try {
    let responses: ResponseRow[] = []; // 2. use the real type

    if (process.env.NODE_ENV === 'development') {
      try {
        const fileContent = await fs.readFile('responses.json', 'utf-8');
        responses = fileContent
          .trim()
          .split('\n')
          .filter((l) => l.trim())
          .map((l) => {
            const parsed = JSON.parse(l);
            return {
              language: parsed.language,
              name: parsed.name,
              state: parsed.state,
              lga: parsed.lga,
              ward: parsed.ward,
              age: parsed.age,
              gender: parsed.gender,
              knows_romeo: parsed.knowsRomeo,
              knows_muyideen: parsed.knowsMuyideen,
              knows_abdulrasheed: parsed.knowsAbdulrasheed,
              heard_savewell: parsed.heardSavewell,
              residence: parsed.residence,
              phone: parsed.phone,
            };
          }); // 3. assert the parsed type
      } catch {
        responses = [];
      }
    } else {
      const { rows } = await sql<ResponseRow>`
        SELECT * FROM responses ORDER BY created_at DESC;
      `;
      responses = rows;
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}