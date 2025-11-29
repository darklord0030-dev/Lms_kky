import React, { useState } from 'react';
import { CheckSquare, Type, BarChart3, Plus } from 'lucide-react';
import MultipleChoiceModal from './MultipleChoiceModal';
import FreeTextModal from './FreeTextModal';
import LikertScaleModal from './LikertScaleModal';
import ExistingQuestionModal from './ExistingQuestionModal';

const questionTypes = [
  { id: 'multiple', name: 'Multiple choice', icon: CheckSquare, description: 'Single or multiple selection' },
  { id: 'freetext', name: 'Free text', icon: Type, description: 'Open-ended responses' },
  { id: 'likert', name: 'Likert scale', icon: BarChart3, description: 'Rating scale questions' },
  { id: 'existing', name: 'Existing question', icon: Plus, description: 'Reuse previous questions' },
];

export default function SurveyUnitContent() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleQuestionTypeClick = (typeId: string) => {
    setActiveModal(typeId);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <div className="mt-6">
        <div className="mb-6 text-center">
          <p className="text-gray-600">There are no questions yet!</p>
          <p className="text-gray-500 text-sm mt-1">
            Add questions from the list below to create your survey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionTypes.slice(0, 3).map((type) => (
            <button
              key={type.id}
              onClick={() => handleQuestionTypeClick(type.id)}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <type.icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                  {type.name}
                </h3>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <div className="w-full md:w-1/3">
            <button
              onClick={() => handleQuestionTypeClick('existing')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Plus className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                  Existing question
                </h3>
              </div>
            </button>
          </div>
        </div>
      </div>

      {activeModal === 'multiple' && (
        <MultipleChoiceModal onClose={handleCloseModal} />
      )}
      {activeModal === 'freetext' && (
        <FreeTextModal onClose={handleCloseModal} />
      )}
      {activeModal === 'likert' && (
        <LikertScaleModal onClose={handleCloseModal} />
      )}
      {activeModal === 'existing' && (
        <ExistingQuestionModal onClose={handleCloseModal} />
      )}
    </>
  );
}
