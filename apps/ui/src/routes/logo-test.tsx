import React, { useState } from 'react';

export function LogoTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogoAPI = async () => {
    setLoading(true);
    setTestResult('Testing...');

    try {
      const apiKey = import.meta.env.VITE_LOGO_DEV_API_KEY;
      console.log('API Key from env:', apiKey ? 'Present' : 'Missing');

      if (!apiKey) {
        setTestResult('ERROR: API key missing from environment variables');
        return;
      }

      const searchQuery = 'lockheed martin';
      const apiUrl = `https://api.logo.dev/search?q=${encodeURIComponent(searchQuery)}`;

      console.log('Making request to:', apiUrl);
      console.log('With API key:', apiKey.substring(0, 10) + '...');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        setTestResult(`ERROR: ${response.status} - ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('API Response:', data);

      setTestResult(`SUCCESS: Found ${Array.isArray(data) ? data.length : 0} results. First result: ${JSON.stringify(data[0] || 'None', null, 2)}`);

    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl mb-4">Logo.dev API Test</h1>

      <button
        onClick={testLogoAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Logo.dev API'}
      </button>

      <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
        {testResult || 'Click button to test API'}
      </pre>
    </div>
  );
}