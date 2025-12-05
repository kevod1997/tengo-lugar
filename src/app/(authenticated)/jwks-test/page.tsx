// src/app/jwks-test/page.tsx
'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export default function JwksTestPage() {
  const [jwksData, setJwksData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const session = authClient.useSession();
  if(!session || session.data?.user.role !== 'admin') {
    router.push('/')
  }

  const fetchJwks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/jwks');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setJwksData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching JWKS:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4 mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">JWKS (JSON Web Key Set) Test</h1>
      
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-amber-800 text-sm">
          <p>
            The JWKS endpoint provides the public keys used to verify JWT tokens.
            External services can use these keys to cryptographically verify tokens
            issued by your application without needing direct access to your database.
          </p>
        </div>
        
        <div className="border p-4 rounded-md">
          <Button 
            onClick={fetchJwks}
            disabled={loading}
            className="mb-4"
          >
            {loading ? 'Loading...' : 'Fetch JWKS Data'}
          </Button>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {jwksData && (
            <div>
              <h2 className="text-lg font-semibold mb-2">JWKS Response:</h2>
              <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-80">
                {JSON.stringify(jwksData, null, 2)}
              </pre>
              
              {jwksData.keys && jwksData.keys.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Key Information:</h3>
                  
                  {jwksData.keys.map((key: any, index: number) => (
                    <div key={index} className="border p-3 rounded-md">
                      <p><span className="font-medium">Key ID (kid):</span> {key.kid}</p>
                      <p><span className="font-medium">Key Type (kty):</span> {key.kty}</p>
                      <p><span className="font-medium">Algorithm (alg):</span> {key.alg || 'Not specified'}</p>
                      <p><span className="font-medium">Curve (crv):</span> {key.crv || 'Not specified'}</p>
                      {key.n && <p><span className="font-medium">Modulus (n):</span> {`${key.n.substring(0, 20)}...`}</p>}
                      {key.e && <p><span className="font-medium">Exponent (e):</span> {key.e}</p>}
                      {key.x && <p><span className="font-medium">X Coordinate:</span> {key.x}</p>}
                      {key.y && <p><span className="font-medium">Y Coordinate:</span> {key.y}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}