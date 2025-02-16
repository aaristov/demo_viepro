'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [response, setResponse] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testMistral = async () => {
      try {
        console.log('Sending request to Mistral...');
        const response = await fetch('/api/mistral/test');
        console.log('Response received:', response.status);
        
        const data = await response.json();
        console.log('Data:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response');
        }
        
        setResponse(data.choices[0].message.content);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setResponse('Failed to get response');
      }
    };

    testMistral();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Mistral Test Page</h1>
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Message sent:</h2>
        <p className="bg-gray-100 p-3 rounded">"Hello"</p>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Response:</h2>
        <p className="bg-gray-100 p-3 rounded">{response}</p>
        {error && (
          <p className="text-red-500 mt-2">Error: {error}</p>
        )}
      </div>
    </div>
  );
}