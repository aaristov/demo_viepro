import { NextResponse } from 'next/server';

const NOCODB_URL = process.env.NOCODB_URL;
const NOCODB_API_KEY = process.env.NOCODB_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patient_id = searchParams.get('patient_id');

    if (!patient_id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    if (!NOCODB_URL || !NOCODB_API_KEY) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const response = await fetch(
      `${NOCODB_URL}/api/v2/tables/mris3k8w3rdyzbb/records?where=(patient_id,eq,${patient_id})`,
      {
        headers: {
          'xc-token': NOCODB_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data from NocoDB');
    }

    const data = await response.json();

    // Calculate average stars per domain
    const domainAverages = data.list.reduce((acc: { [key: string]: { total: number; count: number } }, item: any) => {
      if (!acc[item.domaines]) {
        acc[item.domaines] = { total: 0, count: 0 };
      }
      if (item.stars) {
        acc[item.domaines].total += item.stars;
        acc[item.domaines].count += 1;
      }
      return acc;
    }, {});

    // Convert to averages
    const averages = Object.entries(domainAverages).reduce((acc: { [key: string]: number }, [domain, data]) => {
      acc[domain] = data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0;
      return acc;
    }, {});

    return NextResponse.json(averages);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
