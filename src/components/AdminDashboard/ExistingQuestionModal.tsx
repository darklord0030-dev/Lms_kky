import React from 'react';
import { X } from 'lucide-react';

interface ExistingQuestionModalProps {
  onClose: () => void;
}

export default function ExistingQuestionModal({ onClose }: ExistingQuestionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Add an existing question</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-16 flex flex-col items-center justify-center">
          <div className="mb-6">
            <svg
              className="w-64 h-64"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="100" cy="180" rx="60" ry="10" fill="#E5E7EB" />
              <rect x="70" y="100" width="60" height="80" rx="5" fill="#F3F4F6" />
              <rect x="75" y="105" width="50" height="70" rx="3" fill="white" />
              <circle cx="85" cy="115" r="3" fill="#3B82F6" />
              <rect x="92" y="113" width="30" height="4" rx="2" fill="#3B82F6" />
              <circle cx="85" cy="130" r="3" fill="#D1D5DB" />
              <rect x="92" y="128" width="30" height="4" rx="2" fill="#D1D5DB" />
              <circle cx="85" cy="145" r="3" fill="#D1D5DB" />
              <rect x="92" y="143" width="30" height="4" rx="2" fill="#D1D5DB" />
              <circle cx="100" cy="50" r="20" fill="#F3F4F6" />
              <circle cx="100" cy="45" r="15" fill="#9CA3AF" />
              <path d="M100 35 L95 25 L105 25 Z" fill="#9CA3AF" />
              <rect x="85" y="70" width="30" height="15" rx="7.5" fill="#EF4444" />
              <path d="M130 60 L140 50 M140 60 L150 70" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <h3 className="text-xl font-medium text-gray-900 mb-2">
            There are no questions from other courses yet!
          </h3>
        </div>
      </div>
    </div>
  );
}
