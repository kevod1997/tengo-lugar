// 'use server'

// import { headers } from 'next/headers'

// export async function getRequestMetadata() {
//   const headersList = await headers()
  
//   return {
//     userAgent: headersList.get('user-agent'),
//     isMobile: headersList.get('user-agent')?.toLowerCase().includes('mobile'),
//     ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip'),
//     language: headersList.get('accept-language'),
//     referer: headersList.get('referer'),
//     timestamp: new Date().toISOString()
//   }
// }

'use server'

import { headers } from 'next/headers'

function anonymizeIp(ip: string): string {
  if (!ip) return '0.0.0.0'
  
  // IPv4
  if (ip.includes('.')) {
    return ip.split('.').slice(0, 3).concat(['0']).join('.')
  }
  
  // IPv6
  if (ip.includes(':')) {
    return ip.split(':').slice(0, 4).concat(['0000']).join(':')
  }
  
  return '0.0.0.0'
}

function getClientIp(headersList: Headers): string {
  const ipHeaders = [
    'x-client-ip',
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'true-client-ip'
  ]

  for (const header of ipHeaders) {
    const value = headersList.get(header)
    if (value) {
      const ip = value.split(',')[0].trim()
      if (ip) return anonymizeIp(ip)
    }
  }

  return '0.0.0.0'
}

export async function getRequestMetadata() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const country = headersList.get('x-vercel-ip-country')

  return {
    userAgent: userAgent || 'unknown',
    isMobile: Boolean(userAgent?.toLowerCase().includes('mobile')),
    ip: getClientIp(headersList),
    region: country || null,
    language: headersList.get('accept-language')?.split(',')[0] || 'unknown',
    timestamp: new Date().toISOString()
  }
}