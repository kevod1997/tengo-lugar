// src/app/api/check-jwt-headers/route.ts
import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  // Get the JWT added by middleware
  const middlewareJwt = request.headers.get('x-middleware-jwt');
  
  return NextResponse.json({
    middlewareJwt: middlewareJwt,
    hasMiddlewareJwt: !!middlewareJwt,
    allHeaders: Object.fromEntries(request.headers.entries())
  });
}