import { NextRequest, NextResponse } from 'next/server'

const allowedOrigins = [
  'https://www.tengolugar.store',
  'https://tengolugar.store',
  'http://localhost:3000', // for development
]

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  const response = new NextResponse(null, { status: 200 })
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

// Handle all other methods
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'CORS preflight endpoint' })
}