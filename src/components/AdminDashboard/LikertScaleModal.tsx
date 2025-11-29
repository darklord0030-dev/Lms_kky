import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

interface LikertScaleModalProps {
  onClose: () => void;
}

const scaleTypes = [
  { id: 'agreement', name: 'Level of agreement' },
  { id: 'satisfaction', name: 'Level of satisfaction' },
  { id: 'quality', name: 'Level of quality' },
  { id: 'likelihood', name: 'Likelihood' },
  { id: 'frequency', name: 'Frequency' },
  { id: 'custom', name: 'Custom scale' },
];

const scaleLabels = {
  agreement: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  satisfaction: ['Very unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very satisfied'],
  quality: ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'],
  likelihood: ['Very unlikely', 'Unlikely', 'Neutral', 'Likely', 'Very likely'],
  frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  custom: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
};

export default function LikertScaleModal({ onClose }: LikertScaleModalProps) {
  const [questionText, setQuestionText] = useState('');
  const [subQuestion, setSubQuestion] = useState('');
  const [scaleType, setScaleType] = useState('agreement');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSave = () => {
    console.log({ questionText, subQuestion, scaleType });
    onClose();
  };

  const currentLabels = scaleLabels[scaleType as keyof typeof scaleLabels];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Add likert scale question</h2>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="flex items-start space-x-3">
            <MessageSquare className="w-5 h-5 text-gray-400 mt-3" />
            <input
              type="text"
              placeholder="Enter a question here"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="flex-1 px-0 py-2 text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded">Q1</span>
            <input
              type="text"
              placeholder="Add a question"
              value={subQuestion}
              onChange={(e) => setSubQuestion(e.target.value)}
              className="flex-1 px-0 py-2 text-gray-700 placeholder-gray-400 border-0 focus:ring-0 focus:outline-none"
            />
          </div>

          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              {currentLabels.map((label, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300"></div>
                  <span className="text-xs text-gray-600 text-center w-20">{label}</span>
                </div>
              ))}
            </div>
            <div className="relative h-0.5 bg-gray-300 -mt-8 mx-5"></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Answers</label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {scaleTypes.find(s => s.id === scaleType)?.name}
              </button>

              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {scaleTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setScaleType(type.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        scaleType === type.id ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
