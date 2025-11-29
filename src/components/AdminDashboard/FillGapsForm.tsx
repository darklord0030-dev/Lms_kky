import React, { useState } from 'react';
import { FileText } from 'lucide-react';

interface FillGapsFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
}

export default function FillGapsForm({ onCancel, onSave }: FillGapsFormProps) {
  const [question, setQuestion] = useState('');

  const handleSave = () => {
    onSave({ question });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Add fill the gaps question
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-gray-400 mt-3" />
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
          <p className="text-sm text-gray-600 italic leading-relaxed">
            Note: Compose the question and use [brackets] for the possible answers. For example, "The quick brown [fox] jumps over the lazy [dog]." OR "The [biggest|bigger] planet of our solar system is [jupiter|neptune|earth]." When you use | to offer multiple answers the first should be the correct one.
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
