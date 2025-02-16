import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    
    if (!MISTRAL_API_KEY) {
      console.error('No API key found');
      return NextResponse.json(
        { error: 'Mistral API key not found' },
        { status: 500 }
      );
    }

    // Parse the request body to get the prompt
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    console.log('Sending request to Mistral API with prompt:', prompt);
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error:', errorText);
      throw new Error(`Mistral API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in test route:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Keeping GET for testing purposes
export async function GET() {
  try {
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    
    if (!MISTRAL_API_KEY) {
      console.error('No API key found');
      return NextResponse.json(
        { error: 'Mistral API key not found' },
        { status: 500 }
      );
    }

    console.log('Sending test request to Mistral API...');
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          {
            role: "user",
            content: "Hello"
          }
        ]
      })
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in test route:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}