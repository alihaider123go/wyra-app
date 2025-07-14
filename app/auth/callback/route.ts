import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // handle GET callback
  return NextResponse.json({ message: 'Callback handled' });
}
