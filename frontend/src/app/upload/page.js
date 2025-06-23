'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Upload() {
    // states for upload component
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e) => { // handle file input change
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = async (e) => { // handle form submission
    // prevent default form submission behavior
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !dob || !file) {
      setError('All fields are required.');
      return;
    }

    const dobDate = new Date(dob);
    const today = new Date();
    dobDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (isNaN(dobDate.getTime())) {
      setError('Error: Please enter a valid date of birth.');
      return;
    }

    if (dobDate > today) {
      setError('Error: Date of birth cannot be in the future.');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();// create a new FormData object to hold the form data
    formData.append('firstName', firstName.trim());
    formData.append('lastName', lastName.trim());
    formData.append('dob', dob);
    formData.append('file', file);

    try {
      const ports = [5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008]; // try different ports
      let response;
      for (const port of ports) {
        try {
          response = await axios.post(`http://localhost:${port}/api/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          break;
        } catch (err) {
          if (port === ports[ports.length - 1]) throw err;
        }
      }
      router.push(`/display?data=${encodeURIComponent(JSON.stringify(response.data))}`); // redirect to display page with data
    } catch (err) {
      setError('Error: Failed to upload file. Please ensure the server is running or check file format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A202C] to-[#2D3748] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-[#2D3748] p-8 rounded-xl shadow-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#E2E8F0]">Upload Document</h1>
          <p className="mt-2 text-sm text-gray-400"> Please provide your details and upload a PDF or image.</p>
        </div>
        {error && (
          <p className="text-center text-red-400  text-sm bg-red-900/30 p-2 rounded-md">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-sm  font-medium text-gray-300">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full  rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Enter your first name"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block  text-sm font-medium text-gray-300">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full  rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Enter your last name"
              required
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm  font-medium text-gray-300">Date of Birth</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-1 block w-full  rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="file" className="block text-sm  font-medium text-gray-300">Upload File (PDF/Image)</label>
            <input
              type="file"
              id="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full  rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500"
              required
            />
          </div>
          <div className="flex  justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-32 flex justify-center  py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin  h-5  w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                        Submitting...
                </span>
              ) :  'Submit'} 
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}