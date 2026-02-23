import { NextRequest, NextResponse } from 'next/server';

const GRAPHQL_ENDPOINT = 'https://api-synago.firstlovecenter.com/graphql';
const AUTH_URL = 'https://ndx3y4sa3znyoxzin6bzmoy6fi0jvruc.lambda-url.eu-west-2.on.aws/auth/login';

let cachedToken: string | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }

  console.log('Authenticating with:', {
    url: AUTH_URL,
    email: process.env.API_EMAIL,
    hasPassword: !!process.env.API_PASSWORD,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
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
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data?.tokens?.accessToken;

    if (!cachedToken) {
      console.error('No access token in response:', data);
      throw new Error('Missing access token');
    }

    console.log('Auth successful, token cached');
    return cachedToken;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Authentication request timed out after 10 seconds');
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let token = await getAuthToken();

    const makeRequest = async (authToken: string) => {
      return fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });
    };

    let response = await makeRequest(token);

    // If 401, refresh token and retry
    if (response.status === 401) {
      cachedToken = null;
      token = await getAuthToken();
      response = await makeRequest(token);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'GraphQL request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `GraphQL service unavailable: ${errorMessage}` },
      { status: 500 }
    );
  }
}
