import React, { useState } from 'react';
import { Type } from 'lucide-react';

interface FreeTextModalProps {
  onClose: () => void;
}

export default function FreeTextModal({ onClose }: FreeTextModalProps) {
  const [questionText, setQuestionText] = useState('');

  const handleSave = () => {
    console.log({ questionText });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Add free text question</h2>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start space-x-3">
            <Type className="w-5 h-5 text-gray-400 mt-3" />
            <input
              type="text"
              placeholder="Enter a question here"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="flex-1 px-0 py-2 text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-start space-x-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
