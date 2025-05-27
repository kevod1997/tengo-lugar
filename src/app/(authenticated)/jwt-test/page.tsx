// src/app/jwt-test/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function JwtTestPage() {
  const [middlewareJwt, setMiddlewareJwt] = useState<string | null>(null);
  console.log('Middleware JWT:', middlewareJwt);
  const [directJwt, setDirectJwt] = useState<string | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if middleware added the JWT to the headers
    const checkMiddlewareJwt = async () => {
      try {
        const response = await fetch('/api/check-jwt-headers');
        const data = await response.json();
        
        if (data.middlewareJwt) {
          setMiddlewareJwt(data.middlewareJwt);
        }
      } catch (err) {
        console.error('Error checking middleware JWT:', err);
      }
    };
    
    checkMiddlewareJwt();
  }, []);
  
  const fetchDirectJwt = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/token');
      console.log('Response:', response);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setDirectJwt(data.token);
      
      // Decode the token automatically
      if (data.token) {
        decodeJwt(data.token);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching token directly:', err);
    } finally {
      setLoading(false);
    }
  };

  const decodeJwt = (token: string) => {
    try {
      // Split the token and get the payload part (second part)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      // Base64 decode the payload
      const base64Payload = parts[1];
      const payload = JSON.parse(atob(base64Payload));
      
      // Set the decoded payload
      setDecodedPayload(payload);
    } catch (err) {
      console.error('Error decoding JWT:', err);
      setError('Failed to decode JWT token');
    }
  };

  return (
    <div className="container p-4 mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">JWT Test Page</h1>
      
      <div className="space-y-8">
        <div className="border p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Direct JWT Fetch</h2>
          <Button 
            onClick={fetchDirectJwt}
            disabled={loading}
            className="mb-3"
          >
            {loading ? 'Loading...' : 'Fetch JWT Token'}
          </Button>
          
          {directJwt && (
            <div className="mt-3">
              <p className="font-medium">Token received:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1 break-all">
                {directJwt}
              </pre>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-3">
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {decodedPayload && (
          <div className="border p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Decoded JWT Payload</h2>
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(decodedPayload, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">User Information:</h3>
              <p><span className="font-medium">User ID:</span> {decodedPayload.id || decodedPayload.sub}</p>
              <p><span className="font-medium">Email:</span> {decodedPayload.email}</p>
              <p><span className="font-medium">Name:</span> {decodedPayload.name}</p>
              <p><span className="font-medium">Role:</span> {decodedPayload.role}</p>
              
              <h3 className="font-medium mt-4">Token Information:</h3>
              <p><span className="font-medium">Issued at:</span> {decodedPayload.iat ? new Date(decodedPayload.iat * 1000).toLocaleString() : 'N/A'}</p>
              <p><span className="font-medium">Expires:</span> {decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toLocaleString() : 'N/A'}</p>
              <p><span className="font-medium">Issuer:</span> {decodedPayload.iss}</p>
              <p><span className="font-medium">Audience:</span> {decodedPayload.aud}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}