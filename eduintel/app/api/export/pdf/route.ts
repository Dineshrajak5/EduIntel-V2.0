import { NextRequest, NextResponse } from 'next/server';
import { Institution } from '@/types/institution';

export async function POST(request: NextRequest) {
  try {
    const { institution }: { institution: Institution } = await request.json();

    // PDF generation happens client-side via jspdf
    // This route validates the data and returns it for client-side generation
    if (!institution?.profile?.name) {
      return NextResponse.json({ error: 'Invalid institution data' }, { status: 400 });
    }

    return NextResponse.json({ success: true, institution });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
