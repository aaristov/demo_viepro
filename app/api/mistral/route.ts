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
    const { domain, criteria } = body;

    const prompt = `
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
`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error calling Mistral API:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}