import React, { useState } from 'react';
import { Dice1 } from 'lucide-react';

interface RandomizedFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
}

export default function RandomizedForm({ onCancel, onSave }: RandomizedFormProps) {
  const [question, setQuestion] = useState('');

  const handleSave = () => {
    onSave({ question });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Add randomized question
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-start space-x-3">
          <Dice1 className="w-5 h-5 text-gray-400 mt-3" />
          <div className="flex-1">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter a question here"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 italic">
            Note: Each time this question is shown, it will use a random question from the selected pool. Select questions from the pool below.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <svg className="w-48 h-48" viewBox="0 0 200 200">
              <rect x="40" y="20" width="60" height="40" rx="4" fill="#E5E7EB" />
              <rect x="50" y="25" width="40" height="6" rx="2" fill="#9CA3AF" />
              <rect x="50" y="35" width="30" height="4" rx="2" fill="#D1D5DB" />

              <rect x="20" y="75" width="60" height="40" rx="4" fill="#E5E7EB" />
              <rect x="30" y="80" width="40" height="6" rx="2" fill="#9CA3AF" />
              <rect x="30" y="90" width="30" height="4" rx="2" fill="#D1D5DB" />

              <rect x="60" y="130" width="60" height="40" rx="4" fill="#E5E7EB" />
              <rect x="70" y="135" width="40" height="6" rx="2" fill="#9CA3AF" />
              <rect x="70" y="145" width="30" height="4" rx="2" fill="#D1D5DB" />

              <circle cx="180" cy="60" r="8" fill="#3B82F6" />
              <rect x="155" y="25" width="50" height="8" rx="2" fill="#3B82F6" />
              <line x1="170" y1="40" x2="180" y2="52" stroke="#3B82F6" strokeWidth="3" />

              <circle cx="50" cy="100" r="3" fill="#6B7280" />
              <circle cx="70" cy="100" r="3" fill="#6B7280" />
              <circle cx="60" cy="110" r="3" fill="#6B7280" />

              <path d="M 130 80 Q 140 70 150 80" stroke="#D1D5DB" strokeWidth="2" fill="none" />
              <path d="M 130 90 Q 140 100 150 90" stroke="#D1D5DB" strokeWidth="2" fill="none" />

              <ellipse cx="140" cy="150" rx="30" ry="20" fill="#F3F4F6" />
              <rect x="125" y="140" width="30" height="20" fill="#9CA3AF" opacity="0.3" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            There are no questions you can add to the pool yet!
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 px-6 py-4 flex space-x-3">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
