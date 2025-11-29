import React, { useState } from 'react';
import { FileText, GripVertical, Plus, X } from 'lucide-react';

interface OrderItem {
  id: string;
  text: string;
}

interface OrderingFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
}

export default function OrderingForm({ onCancel, onSave }: OrderingFormProps) {
  const [question, setQuestion] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), text: '' },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 2) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (id: string, text: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, text } : item
      )
    );
  };

  const handleSave = () => {
    onSave({ question, items });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Add ordering question
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

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-3">
              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={item.text}
                onChange={(e) => handleItemChange(item.id, e.target.value)}
                placeholder={`Add the ${index === 0 ? 'first' : index === 1 ? 'second' : 'next'} item`}
                className="flex-1 px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {items.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
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
          onClick={handleAddItem}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add another item</span>
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
