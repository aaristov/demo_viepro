import { withAuth, nocodbFetch } from '@/lib/api';
import { NextResponse } from 'next/server';

const TABLE_ID = 'mxusip10ck64oiu';

// GET /api/patients/[id]
export const GET = withAuth(async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const response = await nocodbFetch(
      `/api/v2/tables/${TABLE_ID}/records/${params.id}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
});