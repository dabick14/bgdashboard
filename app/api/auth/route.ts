import { NextResponse } from 'next/server';

const AUTH_URL = 'https://ndx3y4sa3znyoxzin6bzmoy6fi0jvruc.lambda-url.eu-west-2.on.aws/auth/login';

export async function POST() {
  try {
    console.log('Auth endpoint called, attempting to authenticate...');
    console.log('Using email:', process.env.API_EMAIL);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.API_EMAIL,
        password: process.env.API_PASSWORD,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    console.log('Auth response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Auth failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Authentication failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Auth successful');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Authentication request timed out after 10 seconds. Please check the AUTH_URL.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: `Authentication service unavailable: ${errorMessage}` },
      { status: 500 }
    );
  }
}
