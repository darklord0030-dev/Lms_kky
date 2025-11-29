import { useState } from 'react';
import { Save, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';

type CompletionType = 'button' | 'time' | 'question';
type QuestionType = 'multiple-choice' | 'fill-gaps' | 'ordering' | 'match-pairs' | 'free-text';

function UnitOptions() {
  const [completionType, setCompletionType] = useState<CompletionType>('button');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeLimit, setTimeLimit] = useState('Seconds');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [showQuestionMenu, setShowQuestionMenu] = useState(false);
  const [questionError, setQuestionError] = useState(false);

  const completionOptions = [
    { value: 'button', label: 'With a button' },
    { value: 'time', label: 'After a period of time' },
    { value: 'question', label: 'With a question' }
  ];

  const questionTypes: { value: QuestionType; label: string; icon: string }[] = [
    { value: 'multiple-choice', label: 'Multiple choice', icon: '▭' },
    { value: 'fill-gaps', label: 'Fill the gaps', icon: '|◁▷|' },
    { value: 'ordering', label: 'Ordering', icon: '↕' },
    { value: 'match-pairs', label: 'Match the pairs', icon: '⊟' },
    { value: 'free-text', label: 'Free text', icon: '⌨' }
  ];

  const handleSave = () => {
    if (completionType === 'question' && !selectedQuestion) {
      setQuestionError(true);
      return;
    }
    console.log('Saving...', { completionType, timeLimit, selectedQuestion });
  };

  const handleCancel = () => {
    console.log('Cancelled');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Unit options</h1>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {/* Complete unit section */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-base font-medium text-gray-900 mb-3">
              <CheckSquare className="w-5 h-5" />
              Complete unit
            </label>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full max-w-md px-4 py-3 text-left bg-white border-2 border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:border-blue-600 transition-colors flex items-center justify-between"
              >
                <span className="text-gray-900">
                  {completionOptions.find(opt => opt.value === completionType)?.label}
                </span>
                {dropdownOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute top-full left-0 w-full max-w-md mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 overflow-hidden">
                  {completionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setCompletionType(option.value as CompletionType);
                        setDropdownOpen(false);
                        if (option.value === 'question') {
                          setQuestionError(false);
                        }
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        completionType === option.value
                          ? 'bg-blue-700 text-white hover:bg-blue-800'
                          : 'text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Time limit section (conditional) */}
          {completionType === 'time' && (
            <div className="mb-8">
              <label className="block text-base font-semibold text-gray-900 mb-3">
                Time limit
              </label>
              <div className="relative w-full max-w-md">
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-gray-50 border-2 border-blue-600 rounded-md focus:outline-none focus:border-blue-700 appearance-none text-gray-900 italic"
                >
                  <option value="Seconds">Seconds</option>
                  <option value="Minutes">Minutes</option>
                  <option value="Hours">Hours</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronUp className="w-3 h-3 text-gray-400 -mb-1" />
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* Question section (conditional) */}
          {completionType === 'question' && (
            <div className="mb-8">
              <label className="block text-base font-semibold text-gray-900 mb-3">
                Question
              </label>
              <div className="relative w-full max-w-md mb-2">
                <select
                  value={selectedQuestion}
                  onChange={(e) => {
                    setSelectedQuestion(e.target.value);
                    setQuestionError(false);
                  }}
                  className={`w-full px-4 py-3 pr-10 bg-gray-50 border-2 ${
                    questionError ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:border-blue-600 appearance-none text-gray-600 italic`}
                >
                  <option value="">Select a question</option>
                  <option value="question1">Question 1</option>
                  <option value="question2">Question 2</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
              </div>
              {questionError && (
                <p className="text-red-600 text-sm mb-4">This is a required field</p>
              )}

              {/* Add a question button */}
              <div className="relative">
                <button
                  onClick={() => setShowQuestionMenu(!showQuestionMenu)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                >
                  Add a question
                </button>

                {/* Question type menu */}
                {showQuestionMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2">
                    {questionTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          console.log('Creating question type:', type.value);
                          setShowQuestionMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-900"
                      >
                        <span className="text-gray-600 text-lg w-5">{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-6 flex items-center gap-4">
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
              completionType === 'button'
                ? 'bg-blue-700 text-white hover:bg-blue-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-gray-900 hover:text-gray-700 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnitOptions;
