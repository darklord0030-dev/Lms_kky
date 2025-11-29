import React, { useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';

interface PairItem {
  id: string;
  left: string;
  right: string;
}

interface MatchPairsFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
}

export default function MatchPairsForm({ onCancel, onSave }: MatchPairsFormProps) {
  const [question, setQuestion] = useState('');
  const [pairs, setPairs] = useState<PairItem[]>([
    { id: '1', left: '', right: '' },
    { id: '2', left: '', right: '' },
  ]);

  const handleAddPair = () => {
    setPairs([
      ...pairs,
      { id: Date.now().toString(), left: '', right: '' },
    ]);
  };

  const handleRemovePair = (id: string) => {
    if (pairs.length > 2) {
      setPairs(pairs.filter((pair) => pair.id !== id));
    }
  };

  const handlePairChange = (id: string, side: 'left' | 'right', text: string) => {
    setPairs(
      pairs.map((pair) =>
        pair.id === id ? { ...pair, [side]: text } : pair
      )
    );
  };

  const handleSave = () => {
    onSave({ question, pairs });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Add match the pairs question
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
          <p className="text-sm text-gray-600 italic">
            Note: Add possible answers in the correct order. We'll present them randomly for the end-user.
          </p>
        </div>

        <div className="space-y-4">
          {pairs.map((pair, index) => (
            <div key={pair.id}>
              <div
                className={`grid grid-cols-2 gap-4 p-4 rounded-lg transition-colors ${
                  index === pairs.length - 1 ? 'bg-blue-50' : ''
                }`}
              >
                <div className="relative">
                  <textarea
                    value={pair.left}
                    onChange={(e) => handlePairChange(pair.id, 'left', e.target.value)}
                    placeholder={`Add the ${index === 0 ? 'first' : 'second'} item`}
                    rows={3}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-r-2 border-t-2 border-b-2 border-gray-300 rounded-r-lg"></div>
                </div>
                <div className="relative">
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-l-2 border-t-2 border-b-2 border-gray-300 rounded-l-lg"></div>
                  <textarea
                    value={pair.right}
                    onChange={(e) => handlePairChange(pair.id, 'right', e.target.value)}
                    placeholder={`Add the ${index === 0 ? 'first' : 'second'} item`}
                    rows={3}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
              {pairs.length > 2 && (
                <div className="flex justify-center mt-2">
                  <button
                    type="button"
                    onClick={() => handleRemovePair(pair.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddPair}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add another pair</span>
        </button>
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
