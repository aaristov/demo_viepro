import { NextResponse } from 'next/server';

const NOCODB_BASE_URL = 'https://nocodb.chrono-tea.com/api/v2';

export async function POST(request: Request) {
  try {
    const { criteria, rating, patientId, criteriaId } = await request.json();

    // Create rating record
    const createRatingResponse = await fetch(`${NOCODB_BASE_URL}/tables/mris3k8w3rdyzbb/records`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'xc-token': process.env.NOCODB_API_TOKEN!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Title: criteria,
        type: 'rating',
        data: String(rating),
        rating: rating
      })
    });

    if (!createRatingResponse.ok) {
      throw new Error('Failed to create rating record');
    }

    const ratingRecord = await createRatingResponse.json();
    const recordId = ratingRecord.Id;

    // Link to patient
    const linkPatientResponse = await fetch(
      `${NOCODB_BASE_URL}/tables/mris3k8w3rdyzbb/links/c9i4dxedylmrvxr/records/${recordId}`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'xc-token': process.env.NOCODB_API_TOKEN!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Id: patientId
        })
      }
    );

    if (!linkPatientResponse.ok) {
      throw new Error(`Failed to link patient with id: ${patientId}`);
    }

    // Link to criteria
    const linkCriteriaResponse = await fetch(
      `${NOCODB_BASE_URL}/tables/mris3k8w3rdyzbb/links/cxzwepnaeg4nfo7/records/${recordId}`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'xc-token': process.env.NOCODB_API_TOKEN!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Id: criteriaId
        })
      }
    );

    if (!linkCriteriaResponse.ok) {
      throw new Error('Failed to link criteria');
    }

    return NextResponse.json({ success: true, recordId });
  } catch (error) {
    console.error('Error in ratings API:', error);
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    );
  }
}