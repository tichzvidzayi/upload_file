'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Display() {
    // display components
  const searchParams = useSearchParams(); // retrieve params 
  const data = searchParams.get('data');
  const [result, setResult] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter(); // navigation

  useEffect(() => { // proccess data when component mounts or changes (data - dependency array)
    try {
      if (!data) {
        setResult(null);
        setIsVisible(true);
        return;
      }
      const decodedData = decodeURIComponent(data); // decode data
      const parsedData = JSON.parse(decodedData); // parse JSON data
      if (parsedData && (parsedData.fullName || parsedData.age !== undefined || parsedData.extractedText)) {
        setResult(parsedData);
      } else {
        setResult({ error: 'Error: Invalid data format received.' });
      }
      setIsVisible(true);
    } catch (error) {
      console.error('Error parsing data:', error.message);
      setResult({ error: 'Error: Failed to parse data from URL. Please try uploading again.' });
      setIsVisible(true);
    }
  }, [data]);

  if (!result) {
    return (// render when no data is available
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A202C] to-[#2D3748]">
        <div className="bg-[#2D3748] p-6 rounded-lg shadow-xl text-center max-w-md border border-gray-800">
          <p className="text-red-400 text-lg font-medium">No data available.</p>
          <button
            onClick={() => router.push('/upload')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }
  // render for displaying processed data
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A202C] to-[#2D3748]">
      <div className={`bg-[#2D3748] p-6 rounded-lg shadow-xl w-full max-w-2xl ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 ease-in-out border border-gray-800`}>
        <h1 className="text-2xl font-bold text-[#E2E8F0] text-center mb-6">Processing Results</h1>
        <div className="space-y-6">
          {result.error ? (
              //render error message if parsing failed
            <div className="p-4 bg-gray-700 rounded-md border border-gray-600 text-center">
              <p className="text-red-400 text-sm font-medium">{result.error}</p>
              <button
                onClick={() => router.push('/upload')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : ( // else render results
            <>
              <div className="p-4 bg-gray-700 rounded-md border border-gray-600">
                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                <p className="mt-1 text-[#E2E8F0]">{result.fullName || 'N/A'}</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-md border border-gray-600">
                <label className="block text-sm font-medium text-gray-300">Age</label>
                <p className="mt-1 text-[#E2E8F0]">{result.age || 'N/A'} years</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-md border border-gray-600">
                <label className="block text-sm font-medium text-gray-300">Extracted Text</label>
                <textarea
                  className="mt-1 w-full border border-gray-600 bg-gray-800 text-[#E2E8F0] rounded-md p-2 h-40 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={result.extractedText || 'No text extracted'}
                  readOnly
                  aria-label="Extracted Text"
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => router.push('/upload')}
                  className="w-32 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Back to Upload
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}