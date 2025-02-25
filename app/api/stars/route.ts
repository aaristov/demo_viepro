import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const NOCODB_URL = process.env.NOCODB_BASE_URL;
const NOCODB_API_KEY = process.env.NOCODB_API_TOKEN;

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

interface DomainData {
  average: number | string;
  lastUpdate: string | null;
}

export async function GET(request: NextRequest) {
  try {
    // Get the user session to ensure we only return data for the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the patient ID from the session
    const patient_id = session.user.id;
    
    if (!patient_id) {
      return NextResponse.json({ error: 'Patient ID not found in session' }, { status: 400 });
    }
    
    // Allow admins to override patient_id with query param if needed
    const { searchParams } = new URL(request.url);
    const requestedPatientId = searchParams.get('patient_id');
    
    const isAdmin = session.user.role === 'ADMIN';
    const effectivePatientId = isAdmin && requestedPatientId ? requestedPatientId : patient_id;
    
    if (!isAdmin && requestedPatientId && requestedPatientId !== patient_id) {
      return NextResponse.json({ error: 'Not authorized to access other patient data' }, { status: 403 });
    }

    if (!NOCODB_URL || !NOCODB_API_KEY) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const response = await fetch(
      `${NOCODB_URL}/api/v2/tables/mris3k8w3rdyzbb/records?where=(patient_id,eq,${effectivePatientId})`,
      {
        headers: {
          'xc-token': NOCODB_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data from NocoDB');
    }

    const data = await response.json() as NocoDBResponse;

    // Group by criteres_domaines and calculate average rating and track last update
    const domainData = data.list.reduce((acc: { [key: string]: { total: number; count: number; lastUpdate: string | null } }, item) => {
      const domain = item.criteres_domaine;
      if (!acc[domain]) {
        acc[domain] = { total: 0, count: 0, lastUpdate: null };
      }
      if (item.rating) {
        acc[domain].total += item.rating;
        acc[domain].count += 1;
        
        // Update lastUpdate if this record is more recent
        const itemDate = item.UpdatedAt || item.CreatedAt;
        if (!acc[domain].lastUpdate || itemDate > acc[domain].lastUpdate) {
          acc[domain].lastUpdate = itemDate;
        }
      }
      return acc;
    }, {});

    // Convert to averages and format for display
    const domainInfo: { [key: string]: DomainData } = Object.entries(domainData).reduce((acc, [domain, data]) => {
      acc[domain] = {
        average: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 'NA',
        lastUpdate: data.lastUpdate
      };
      return acc;
    }, {} as { [key: string]: DomainData });

    return NextResponse.json(domainInfo);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}