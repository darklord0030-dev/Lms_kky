import React, { useState } from 'react';
import { FileText } from 'lucide-react';

export default function MainContent() {
  const [activeTab, setActiveTab] = useState('content');
  const [description, setDescription] = useState('');

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header with gradient background */}
      <div className="relative h-64 bg-gradient-to-r from-blue-900 via-blue-800 to-orange-500 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">New course</h1>
        
        {/* Decorative smile icon */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <div className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center">
            <div className="w-16 h-8 border-b-4 border-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 bg-gray-50 p-6">
        {/* Description input */}
        <div className="mb-6">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a course description up to 5000 characters"
            className="w-full h-24 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={5000}
          />
        </div>

        {/* Content tabs and area */}
        <div className="bg-white rounded-lg border border-gray-200 min-h-96">
          {/* Tab navigation */}
          <div className="border-b border-gray-200 flex items-center justify-between">
            <div className="flex">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'files'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Files
              </button>
            </div>
            
            <div className="px-6 py-3 text-sm text-gray-600">
              All units must be completed
            </div>
          </div>

          {/* Tab content */}
          <div className="p-8">
            {activeTab === 'content' && (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-600 mb-2">This course is empty</h3>
                <p className="text-gray-600">
                  Drag and drop files here, or click the Add button to the left, to build your course.
                </p>
              </div>
            )}
            
            {activeTab === 'files' && (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No files uploaded</h3>
                <p className="text-gray-600">
                  Upload files to make them available in your course content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}