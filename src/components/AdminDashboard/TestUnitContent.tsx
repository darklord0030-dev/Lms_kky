import React, { useState } from 'react';
import { Shuffle, CheckSquare, AlignLeft, ArrowUpDown, Link, Type, Dice1, Upload, Plus } from 'lucide-react';
import MultipleChoiceForm from './MultipleChoiceForm';
import FillGapsForm from './FillGapsForm';
import OrderingForm from './OrderingForm';
import MatchPairsForm from './MatchPairsForm';
import FreeTextForm from './FreeTextForm';
import RandomizedForm from './RandomizedForm';

const questionTypes = [
  { id: 'multiple', name: 'Multiple choice', icon: CheckSquare, description: 'Single or multiple correct answers' },
  { id: 'fill', name: 'Fill the gaps', icon: AlignLeft, description: 'Complete missing text' },
  { id: 'ordering', name: 'Ordering', icon: ArrowUpDown, description: 'Put items in correct order' },
  { id: 'match', name: 'Match the pairs', icon: Link, description: 'Connect related items' },
  { id: 'freetext', name: 'Free text', icon: Type, description: 'Open-ended responses' },
  { id: 'randomized', name: 'Randomized', icon: Dice1, description: 'Random question selection' },
  { id: 'import', name: 'Import questions', icon: Upload, description: 'Import from external sources' },
  { id: 'existing', name: 'Existing question', icon: Plus, description: 'Reuse previous questions' },
];

export default function TestUnitContent() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState('Test unit');
  const [description, setDescription] = useState('');

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleCancel = () => {
    setSelectedType(null);
  };

  const handleSave = (questionData: any) => {
    console.log('Question saved:', questionData);
    setSelectedType(null);
  };

  if (selectedType === 'multiple') {
    return <MultipleChoiceForm onCancel={handleCancel} onSave={handleSave} />;
  }

  if (selectedType === 'fill') {
    return <FillGapsForm onCancel={handleCancel} onSave={handleSave} />;
  }

  if (selectedType === 'ordering') {
    return <OrderingForm onCancel={handleCancel} onSave={handleSave} />;
  }

  if (selectedType === 'match') {
    return <MatchPairsForm onCancel={handleCancel} onSave={handleSave} />;
  }

  if (selectedType === 'freetext') {
    return <FreeTextForm onCancel={handleCancel} onSave={handleSave} />;
  }

  if (selectedType === 'randomized') {
    return <RandomizedForm onCancel={handleCancel} onSave={handleSave} />;
  }

  return (
    <div>
      <div className="mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full mb-4"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description here"
          className="text-lg text-gray-400 bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder-gray-400"
        />
      </div>

      <div className="mb-6 text-center">
        <p className="text-gray-600 text-lg font-medium">There are no questions yet!</p>
        <p className="text-gray-500 text-sm mt-1">
          Add questions from the list below to create your test.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questionTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type.id)}
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
    </div>
  );
}
