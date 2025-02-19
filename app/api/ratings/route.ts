import { NextResponse } from 'next/server';

const NOCODB_API_URL = 'https://nocodb.chrono-tea.com/api/v2';
const NOCODB_TABLE = 'mris3k8w3rdyzbb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patient_id');

  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${NOCODB_API_URL}/tables/${NOCODB_TABLE}/records?where=(patient_id,eq,${patientId})`,
      {
        headers: {
          'xc-token': process.env.NOCODB_TOKEN || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch ratings');
    }

    const data = await response.json();

    // Calculate average stars per domain
    const domainRatings = data.list.reduce((acc: { [key: string]: { total: number; count: number } }, item: any) => {
      if (!acc[item.domaines]) {
        acc[item.domaines] = { total: 0, count: 0 };
      }
      if (item.stars) {
        acc[item.domaines].total += item.stars;
        acc[item.domaines].count += 1;
      }
      return acc;
    }, {});

    // Calculate averages
    const averages = Object.entries(domainRatings).reduce((acc: { [key: string]: number }, [domain, values]) => {
      acc[domain] = values.count > 0 ? Math.round((values.total / values.count) * 10) / 10 : 0;
      return acc;
    }, {});

    return NextResponse.json({ averages });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}
