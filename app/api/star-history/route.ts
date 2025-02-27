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
  criteres: string;
}

interface NocoDBResponse {
  list: NocoDBRecord[];
}

interface HistoryEntry {
  criteriaId: string;
  criteria: string;
  date: string;
  rating: number;
}

interface HistoryResponse {
  [domain: string]: {
    entries: HistoryEntry[];
    criteriaMap: {
      [criteriaId: string]: string;
    };
  };
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
    const domain = searchParams.get('domain');
    
    const isAdmin = session.user.role === 'ADMIN';
    const effectivePatientId = isAdmin && requestedPatientId ? requestedPatientId : patient_id;
    
    if (!isAdmin && requestedPatientId && requestedPatientId !== patient_id) {
      return NextResponse.json({ error: 'Not authorized to access other patient data' }, { status: 403 });
    }

    if (!NOCODB_URL || !NOCODB_API_KEY) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    // First fetch all criteria for the domain to get their text
    const criteriaMap: Record<string, string> = {};
    if (domain) {
      const criteriaResponse = await fetch(
        `${NOCODB_URL}/api/v2/tables/mzcl6pd7yewrrvj/records?where=(domaines,eq,${encodeURIComponent(domain)})`,
        {
          headers: {
            'xc-token': NOCODB_API_KEY,
          },
        }
      );
      
      if (criteriaResponse.ok) {
        const criteriaData = await criteriaResponse.json();
        console.log('Criteria data:', criteriaData);
        // Create a map of criteria to its text
        criteriaData.list.forEach((item: any) => {
          if (item.criteres) {
            criteriaMap[item.criteres] = item.criteres;
          }
        });
      }
    }

    // Fetch patient's star ratings
    let apiUrl = `${NOCODB_URL}/api/v2/tables/mris3k8w3rdyzbb/records?where=(patient_id,eq,${effectivePatientId})`;
    
    // Add domain filter if specified
    if (domain) {
      apiUrl += `&where=(criteres_domaine,eq,${encodeURIComponent(domain)})`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'xc-token': NOCODB_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from NocoDB');
    }

    const data = await response.json() as NocoDBResponse;
    console.log('Data:', data);
    // Process the data to group by domain and then by criteria and date
    const historyData: HistoryResponse = {};

    data.list.forEach(record => {
      const domain = record.criteres_domaine;
      const dateStr = record.UpdatedAt || record.CreatedAt;
      const date = new Date(dateStr);
      // Format date to YYYY-MM-DD for grouping
      const formattedDate = date.toISOString().split('T')[0];
      
      if (!historyData[domain]) {
        historyData[domain] = {
          entries: [],
          criteriaMap: {}
        };
      }
      
      // Use the criteria name from the record, or fall back to a friendly label
      let criteriaId = record.criteres || '';
      if (!criteriaId && record.Id) {
        criteriaId = `question-${record.Id}`;
      }
      
      let criteriaName = criteriaMap[criteriaId] || record.criteres || `Question ${record.Id}`;
      
      // Store criteria name in the map
      historyData[domain].criteriaMap[criteriaId] = criteriaName;
      
      // Add the entry to the history
      historyData[domain].entries.push({
        criteriaId,
        criteria: criteriaName,
        date: formattedDate,
        rating: record.rating
      });
    });

    return NextResponse.json(historyData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}