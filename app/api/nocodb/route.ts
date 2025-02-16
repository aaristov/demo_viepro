import { NextResponse } from 'next/server';
import type { NocoDBResponse } from '@/app/types/nocodb';

export async function GET() {
  try {
    const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
    
    if (!NOCODB_API_TOKEN) {
      return NextResponse.json(
        { error: 'NocoDB API token not found' },
        { status: 500 }
      );
    }

    const url = 'https://nocodb.chrono-tea.com/api/v2/tables/mzcl6pd7yewrrvj/records?offset=0&limit=25&where=&viewId=vwvzzonyw6jub212';
    const options = {
      method: 'GET',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
      },
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: NocoDBResponse = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching data from NocoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from NocoDB' },
      { status: 500 }
    );
  }
}