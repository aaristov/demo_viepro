import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    
    if (!MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: 'Mistral API key not found' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Handle both direct messages and question generation
    let messages;
    if (body.message) {
      // Direct chat message
      messages = [{
        role: "user",
        content: body.message
      }];
    } else {
      // Question generation for the wheel
      const { domain, criteria } = body;
      messages = [{
        role: "user",
        content: `
Based on the following domain and criteria from a workplace satisfaction survey, create a friendly, conversational question to assess the user's satisfaction level from 1-5.

Domain: ${domain}
Criteria: ${criteria}

Guidelines:
- Keep the tone warm and casual
- Make it personal and engaging
- Include the 1-5 scale in the question
- Focus on satisfaction/well-being
- Keep it short and clear

Example format: "How satisfied are you with [aspect] on a scale of 1-5, where 1 is [negative] and 5 is [positive]?"
`
      }];
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mistral API error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('Error calling Mistral API:', error);
    
    // Type guard to check if error is an Error object
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to generate response', details: error.message },
        { status: 500 }
      );
    }
    
    // Fallback for non-Error objects
    return NextResponse.json(
      { error: 'Failed to generate response', details: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}