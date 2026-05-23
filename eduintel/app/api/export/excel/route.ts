import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Excel generation is done client-side via exceljs in browser
  return NextResponse.json({ success: true, message: 'Use client-side generation' });
}
