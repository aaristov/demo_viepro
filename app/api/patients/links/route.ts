import { withAuth, nocodbFetch } from '@/lib/api';
import { NextResponse } from 'next/server';

const TABLE_ID = 'mxusip10ck64oiu';

// GET /api/patients/links?linkFieldId=xxx&recordId=yyy
export const GET = withAuth(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const linkFieldId = searchParams.get('linkFieldId');
  const recordId = searchParams.get('recordId');

  if (!linkFieldId || !recordId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const response = await nocodbFetch(
      `/api/v2/tables/${TABLE_ID}/links/${linkFieldId}/records/${recordId}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch linked records' }, { status: 500 });
  }
});

// POST /api/patients/links
export const POST = withAuth(async (req: Request) => {
  const { linkFieldId, recordId, body } = await req.json();

  try {
    const response = await nocodbFetch(
      `/api/v2/tables/${TABLE_ID}/links/${linkFieldId}/records/${recordId}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to link records' }, { status: 500 });
  }
});

// DELETE /api/patients/links
export const DELETE = withAuth(async (req: Request) => {
  const { linkFieldId, recordId } = await req.json();

  try {
    const response = await nocodbFetch(
      `/api/v2/tables/${TABLE_ID}/links/${linkFieldId}/records/${recordId}`,
      {
        method: 'DELETE',
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unlink records' }, { status: 500 });
  }
});