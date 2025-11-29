import React, { useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MultipleChoiceFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
}

export default function MultipleChoiceForm({ onCancel, onSave }: MultipleChoiceFormProps) {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([
    { id: '1', text: '', isCorrect: false },
    { id: '2', text: '', isCorrect: false },
  ]);

  const handleAddAnswer = () => {
    setAnswers([
      ...answers,
      { id: Date.now().toString(), text: '', isCorrect: false },
    ]);
  };

  const handleRemoveAnswer = (id: string) => {
    if (answers.length > 2) {
      setAnswers(answers.filter((answer) => answer.id !== id));
    }
  };

  const handleAnswerChange = (id: string, text: string) => {
    setAnswers(
      answers.map((answer) =>
        answer.id === id ? { ...answer, text } : answer
      )
    );
  };

  const handleCorrectToggle = (id: string) => {
    setAnswers(
      answers.map((answer) =>
        answer.id === id ? { ...answer, isCorrect: !answer.isCorrect } : answer
      )
    );
  };

  const handleSave = () => {
    onSave({ question, answers });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Add multiple choice question
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

        <div className="space-y-3">
          {answers.map((answer, index) => (
            <div key={answer.id} className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleCorrectToggle(answer.id)}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 transition-colors ${
                  answer.isCorrect
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {answer.isCorrect && (
                  <svg
                    className="w-full h-full text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <input
                type="text"
                value={answer.text}
                onChange={(e) => handleAnswerChange(answer.id, e.target.value)}
                placeholder="Add an answer"
                className="flex-1 px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {answers.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAnswer(answer.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddAnswer}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add another answer</span>
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
