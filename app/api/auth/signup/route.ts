// app/api/auth/signup/route.ts
import { nocodbFetch } from '@/lib/api';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

const TABLE_ID = 'mxusip10ck64oiu';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'surname', 'email', 'password', 'birthdate', 'city'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const encodedEmail = encodeURIComponent(body.email.toLowerCase());
    const query = `(email,eq,${encodedEmail})`;
    const checkUser = await nocodbFetch(
      `/api/v2/tables/${TABLE_ID}/records?where=${query}`
    );
    const existingUser = await checkUser.json();
    
    if (existingUser.list?.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(body.password, 12);
    
    // Prepare user data - using exact same field names as in the working cURL request
    const userData = {
      name: body.name.trim(),
      surname: body.surname.trim(),
      email: body.email.toLowerCase().trim(),
      password: Buffer.from(hashedPassword).toString('base64'),
      birthdate: body.birthdate,
      city: body.city.trim(),
      role: 'user'
    };

    console.log('Sending user data to NocoDB:', {
      ...userData,
      password: '[REDACTED]'
    });

    const response = await nocodbFetch(`/api/v2/tables/${TABLE_ID}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Failed to register user');
    }

    const data = await response.json();
    const { password, ...userWithoutPassword } = data;
    
    return NextResponse.json({
      status: 'success',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register user' },
      { status: 500 }
    );
  }
}