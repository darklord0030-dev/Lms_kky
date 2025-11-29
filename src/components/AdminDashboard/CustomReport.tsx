import { useState } from 'react';
import { X } from 'lucide-react';
import reportIllustration from "../assets/report.png";

interface OutputField {
  id: string;
  label: string;
}

function App() {
  const [showAddReport, setShowAddReport] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('Specific users');
  const [selectedOutputs, setSelectedOutputs] = useState<OutputField[]>([
    { id: 'user', label: 'User' },
    { id: 'email', label: 'Email' },
    { id: 'user_type', label: 'User type' },
    { id: 'registration_date', label: 'Registration date' },
    { id: 'last_login', label: 'Last login' },
    { id: 'assigned_courses', label: 'Assigned courses' },
    { id: 'completed_courses', label: 'Completed courses' },
  ]);

  const removeOutput = (id: string) => {
    setSelectedOutputs(selectedOutputs.filter(output => output.id !== id));
  };

  return (
    <div className="max-h-screen bg-white">
      {!showAddReport ? (
        <div className="max-w-7xl mx-auto px-5 py-3">
          <div className="mb-2">
            <a href="#" className="text-blue-600 text-sm font-medium hover:underline">
              Reports
            </a>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-12">Custom reports</h1>

          <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto mt-10">
            <div className="mb-4">
              <img
                src={reportIllustration}
                alt="Person with reports illustration"
                className="w-80 "
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              There are no custom reports yet!
            </h2>

            <p className="text-gray-600 text-center mb-8 max-w-2xl">
              Create personalized reports and perform actions that affect several users at once
            </p>

            <button
              onClick={() => setShowAddReport(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded transition-colors"
            >
              Add report
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Add report</h1>
            </div>

            <div className="px-8 py-6 space-y-8">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Name
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Type a report name"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMS41TDYgNi41TDExIDEuNSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat"
                >
                  <option>Specific users</option>
                  <option>All users</option>
                  <option>User groups</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Ruleset
                </label>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center pt-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                    <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <select className="w-full px-4 py-3 bg-white border-2 border-blue-500 rounded text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMS41TDYgNi41TDExIDEuNSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat">
                      <option>Select a rule</option>
                      <option>User status</option>
                      <option>Course completion</option>
                      <option>Last login date</option>
                    </select>
                    <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors">
                      Add rule
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Output
                </label>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex flex-wrap gap-2">
                    {selectedOutputs.map((output) => (
                      <div
                        key={output.id}
                        className="inline-flex items-center gap-2 bg-blue-100 text-blue-900 px-3 py-1.5 rounded text-sm font-medium"
                      >
                        <button
                          onClick={() => removeOutput(output.id)}
                          className="hover:bg-blue-200 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {output.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddReport(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddReport(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-8 py-3 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
