import { NextRequest, NextResponse } from 'next/server'

const GRAPHQL_ENDPOINT = 'https://api-synago.firstlovecenter.com/graphql'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'GraphQL request failed' },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('GraphQL proxy error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `GraphQL service unavailable: ${errorMessage}` },
      { status: 500 },
    )
  }
}
