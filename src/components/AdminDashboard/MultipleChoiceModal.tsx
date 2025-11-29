import React, { useState } from 'react';
import { AlignLeft, X } from 'lucide-react';

interface MultipleChoiceModalProps {
  onClose: () => void;
}

export default function MultipleChoiceModal({ onClose }: MultipleChoiceModalProps) {
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState<string[]>(['', '']);
  const [singleAnswer, setSingleAnswer] = useState(false);

  const handleAddAnswer = () => {
    setAnswers([...answers, '']);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length > 1) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
    }
  };

  const handleSave = () => {
    console.log({ questionText, answers, singleAnswer });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Add multiple choice question</h2>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="flex items-start space-x-3">
            <AlignLeft className="w-5 h-5 text-gray-400 mt-3" />
            <input
              type="text"
              placeholder="Enter a question here"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="flex-1 px-0 py-2 text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center space-x-3 group">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                <input
                  type="text"
                  placeholder={index === 0 ? 'Add an answer' : 'Add an answer (optional)'}
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="flex-1 px-0 py-2 text-gray-700 placeholder-gray-400 border-0 focus:ring-0 focus:outline-none"
                />
                {answers.length > 1 && (
                  <button
                    onClick={() => handleRemoveAnswer(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddAnswer}
              className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
              <span className="text-sm">Add another answer</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={() => setSingleAnswer(!singleAnswer)}
              className={`w-12 h-6 rounded-full transition-colors ${
                singleAnswer ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  singleAnswer ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></div>
            </button>
            <span className="text-sm text-gray-700">Only one answer can be selected</span>
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
