import { nocodbFetch } from '@/lib/api';
import { NextResponse } from 'next/server';
import { format } from 'date-fns';

const TABLE_ID = 'mxusip10ck64oiu';

// Function to validate date format (YYYY-MM-DD)
function isValidDateFormat(dateStr: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log incoming request body (excluding sensitive data)
    console.log('Incoming request body:', {
      ...body,
      password: '[REDACTED]'
    });

    // Encode the password
    const encodedPassword = Buffer.from(body.password).toString('base64');
    
    // Get date string
    let dateStr = body.birthdate;
    console.log('Original date string:', dateStr);

    // If it's not in the correct format, try to format it
    if (!isValidDateFormat(dateStr)) {
      try {
        dateStr = format(new Date(dateStr), 'yyyy-MM-dd');
        console.log('Reformatted date string:', dateStr);
      } catch (error) {
        console.error('Date formatting error:', error);
        throw new Error('Invalid date format. Please provide date in YYYY-MM-DD format');
      }
    }

    // Prepare user data
    const userData = {
      name: body.name,
      surname: body.surname,
      email: body.email,
      password: encodedPassword,
      birthdate: dateStr,
      city: body.city
    };

    console.log('Sending data to NocoDB:', {
      ...userData,
      password: '[REDACTED]'
    });

    const response = await nocodbFetch(`/api/v2/tables/${TABLE_ID}/records`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // If the response is not ok, get the error details
    if (!response.ok) {
      const errorData = await response.json();
      console.error('NocoDB API error response:', errorData);
      throw new Error(errorData.msg || 'Failed to register user');
    }

    const data = await response.json();
    
    // Remove password from response
    const { password, ...userWithoutPassword } = data;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register user' },
      { status: 500 }
    );
  }
}