import React, { useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';

interface Rule {
  id: string;
  condition: string;
  keyword: string;
  points: number;
}

interface FreeTextFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
}

export default function FreeTextForm({ onCancel, onSave }: FreeTextFormProps) {
  const [question, setQuestion] = useState('');
  const [threshold, setThreshold] = useState(0);
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', condition: 'contains', keyword: '', points: 0 },
  ]);

  const handleAddRule = () => {
    setRules([
      ...rules,
      { id: Date.now().toString(), condition: 'contains', keyword: '', points: 0 },
    ]);
  };

  const handleRemoveRule = (id: string) => {
    if (rules.length > 1) {
      setRules(rules.filter((rule) => rule.id !== id));
    }
  };

  const handleRuleChange = (id: string, field: keyof Rule, value: string | number) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };

  const handleSave = () => {
    onSave({ question, threshold, rules });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Add free text question
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

        <div className="flex items-center space-x-3">
          <span className="text-gray-700">Consider correct when accumulated points are greater or equal to</span>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-24 px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Rules</h3>

          {rules.map((rule) => (
            <div key={rule.id} className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-gray-700">When</span>
                  <select
                    value={rule.condition}
                    onChange={(e) => handleRuleChange(rule.id, 'condition', e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="contains">contains</option>
                    <option value="equals">equals</option>
                    <option value="starts_with">starts with</option>
                    <option value="ends_with">ends with</option>
                  </select>
                  <span className="text-gray-700">the word</span>
                  <input
                    type="text"
                    value={rule.keyword}
                    onChange={(e) => handleRuleChange(rule.id, 'keyword', e.target.value)}
                    placeholder="e.g., fast / quick"
                    className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">add</span>
                  <select
                    value={rule.points}
                    onChange={(e) => handleRuleChange(rule.id, 'points', Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <span className="text-gray-700">points</span>

                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(rule.id)}
                      className="ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddRule}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add another rule</span>
          </button>
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
