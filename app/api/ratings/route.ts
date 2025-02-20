import { NextResponse } from 'next/server';

const NOCODB_URL = process.env.NOCODB_BASE_URL;
const NOCODB_API_KEY = process.env.NOCODB_API_TOKEN;
const NOCODB_TABLE = 'mris3k8w3rdyzbb';

interface NocoDBRecord {
  Id: number;
  Title: string;
  CreatedAt: string;
  UpdatedAt: string | null;
  patient_id: number;
  type: string;
  data: string;
  rating: number;
  criteres_domaine: string;
}

interface NocoDBResponse {
  list: NocoDBRecord[];
}

interface DomainRatings {
  total: number;
  count: number;
}

interface RatingRequest {
  criteria: string;
  rating: number;
  patientId: number;
  criteriaId: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patient_id');

  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
  }

  if (!NOCODB_URL || !NOCODB_API_KEY) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${NOCODB_URL}/api/v2/tables/${NOCODB_TABLE}/records?where=(patient_id,eq,${patientId})`,
      {
        headers: {
          'xc-token': NOCODB_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch ratings');
    }

    const data = await response.json() as NocoDBResponse;

    // Calculate average stars per domain
    const domainRatings = data.list.reduce((acc: Record<string, DomainRatings>, item) => {
      const domain = item.criteres_domaine;
      if (!acc[domain]) {
        acc[domain] = { total: 0, count: 0 };
      }
      if (item.rating) {
        acc[domain].total += item.rating;
        acc[domain].count += 1;
      }
      return acc;
    }, {});

    // Calculate averages
    const averages = Object.entries(domainRatings).reduce((acc: Record<string, number>, [domain, values]: [string, DomainRatings]) => {
      acc[domain] = values.count > 0 ? Math.round((values.total / values.count) * 10) / 10 : 0;
      return acc;
    }, {});

    return NextResponse.json(averages);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!NOCODB_URL || !NOCODB_API_KEY) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  try {
    const { criteria, rating, patientId, criteriaId } = await request.json() as RatingRequest;

    if (!criteria || !rating || !patientId || !criteriaId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${NOCODB_URL}/api/v2/tables/${NOCODB_TABLE}/records`,
      {
        method: 'POST',
        headers: {
          'xc-token': NOCODB_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Title: criteria,
          patient_id: patientId,
          type: 'rating',
          data: rating.toString(),
          'critères_id': criteriaId,
          rating: rating,
          CreatedAt: new Date().toISOString()
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('NocoDB error:', errorData);
      throw new Error('Failed to save rating');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving rating:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}