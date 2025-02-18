import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const NOCODB_BASE_URL = 'https://nocodb.chrono-tea.com';

// Load token at runtime
const getNocoDBToken = () => {
  const token = process.env.NOCODB_AUTH_TOKEN;
  if (!token) {
    throw new Error('NocoDB authentication token is not configured');
  }
  return token;
};

export async function withAuth(handler: Function) {
  return async function(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return handler(req, session);
  };
}

export async function nocodbFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${NOCODB_BASE_URL}${endpoint}`;
  const token = getNocoDBToken();
  
  console.log('Making NocoDB request to:', url);
  
  const headers = {
    'xc-token': token,
    'accept': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { 
      ...options, 
      headers,
    });

    if (!response.ok) {
      console.error('NocoDB API error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
      throw new Error(`NocoDB API error: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    console.error('NocoDB API request failed:', error);
    throw error;
  }
}