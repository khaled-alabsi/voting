import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ClipboardDocumentListIcon, ChartBarIcon } from '@heroicons/react/24/outline';

function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Create and Share Voting Pools
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Build custom voting pools with flexible questions and answers. 
          Share with unique links and track real-time results.
        </p>
        
        <Link
          to="/create"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create New Pool</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Flexible Questions
          </h3>
          <p className="text-gray-600">
            Create custom questions with multiple answer choices. 
            Add or modify questions and answers as needed.
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ChartBarIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Real-time Analytics
          </h3>
          <p className="text-gray-600">
            Track votes per option, voting patterns, and timing analytics. 
            Export results when complete.
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Easy Sharing
          </h3>
          <p className="text-gray-600">
            Get unique shareable links for each pool. 
            Support for anonymous voting and automatic expiry.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          How it works
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
              1
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Create</h4>
            <p className="text-sm text-gray-600">Set up your questions and answers</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
              2
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Share</h4>
            <p className="text-sm text-gray-600">Send the unique link to participants</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
              3
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Vote</h4>
            <p className="text-sm text-gray-600">Participants cast their votes</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
              4
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Analyze</h4>
            <p className="text-sm text-gray-600">View results and export data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;