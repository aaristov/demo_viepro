import { withAuth, nocodbFetch } from '@/lib/api';
import { NextResponse } from 'next/server';

const TABLE_ID = 'mxusip10ck64oiu';

// GET /api/patients
export const GET = withAuth(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '25';

  try {
    const response = await nocodbFetch(
      `/api/v2/tables/${TABLE_ID}/records?page=${page}&limit=${limit}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
});

// POST /api/patients
export const POST = withAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const response = await nocodbFetch(`/api/v2/tables/${TABLE_ID}/records`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
});

// PATCH /api/patients
export const PATCH = withAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const response = await nocodbFetch(`/api/v2/tables/${TABLE_ID}/records`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
});

// DELETE /api/patients
export const DELETE = withAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const response = await nocodbFetch(`/api/v2/tables/${TABLE_ID}/records`, {
      method: 'DELETE',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
});