import React, { useState } from "react";

export default function TestOptions() {
  const [activeTab, setActiveTab] = useState("configuration");

  // Config tab
  const [duration, setDuration] = useState("");
  const [passScore, setPassScore] = useState("50");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [allowRepetitions, setAllowRepetitions] = useState(false);

  // Weight tab
  const [weights, setWeights] = useState([
    { id: 1, name: "Section A", value: 50 },
    { id: 2, name: "Section B", value: 50 },
  ]);
  const updateWeight = (id: number, newValue: number) =>
    setWeights(weights.map((w) => (w.id === id ? { ...w, value: newValue } : w)));
  const addSection = () => {
    const nextId = weights.length + 1;
    setWeights([...weights, { id: nextId, name: `Section ${nextId}`, value: 0 }]);
  };
  const removeSection = (id: number) => setWeights(weights.filter((w) => w.id !== id));

  // Completion tab
  const [showCorrectAnswers, setShowCorrectAnswers] = useState("When passed");
  const [showGivenAnswers, setShowGivenAnswers] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [hideCorrectQs, setHideCorrectQs] = useState(false);
  const [showFeedback, setShowFeedback] = useState("Always");

  // Behavior
  const [allowMovement, setAllowMovement] = useState(false);
  const [checkAnswers, setCheckAnswers] = useState(false);
  const [abandonOnFail, setAbandonOnFail] = useState(false);

  // Security
  const [requireSnapshot, setRequireSnapshot] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);

  // Messages
  const [passMessage, setPassMessage] = useState("");

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-lg shadow p-6 space-y-6">
      {/* Tabs */}
      <div className="flex border-b">
        {["configuration", "weight", "completion"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px border-b-2 font-medium capitalize ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Config Tab */}
      {activeTab === "configuration" && (
        <div className="space-y-6">
          {/* Details */}
          <div>
            <h3 className="font-semibold">📄 Details</h3>
            <div className="mt-2 space-y-4">
              <div>
                <label className="block text-sm text-gray-600">Duration</label>
                <input
                  type="number"
                  placeholder="Minutes"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 block w-40 px-3 py-2 border rounded-md text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Pass score</label>
                <div className="flex items-center border rounded-md bg-gray-50 w-40">
                  <input
                    type="number"
                    value={passScore}
                    onChange={(e) => setPassScore(e.target.value)}
                    className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
                  />
                  <span className="px-2 text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Randomization */}
          <div>
            <h3 className="font-semibold">🎲 Randomization</h3>
            <div className="mt-2 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={() => setShuffleQuestions(!shuffleQuestions)}
                />
                Shuffle questions
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleAnswers}
                  onChange={() => setShuffleAnswers(!shuffleAnswers)}
                />
                Shuffle possible answers
              </label>
            </div>
          </div>

          {/* Repetitions */}
          <div>
            <h3 className="font-semibold">🔄 Repetitions</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowRepetitions}
                onChange={() => setAllowRepetitions(!allowRepetitions)}
              />
              Allow repetitions
            </label>
          </div>
        </div>
      )}

      {/* Weight Tab */}
      {activeTab === "weight" && (
        <div className="space-y-6">
          <h3 className="font-semibold">⚖️ Section Weights</h3>
          <div className="space-y-3">
            {weights.map((section) => (
              <div key={section.id} className="flex items-center gap-3">
                <span className="flex-1 text-gray-700">{section.name}</span>
                <div className="flex items-center border rounded-md bg-gray-50 w-32">
                  <input
                    type="number"
                    value={section.value}
                    onChange={(e) => updateWeight(section.id, Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
                  />
                  <span className="px-2 text-gray-500">%</span>
                </div>
                <button
                  onClick={() => removeSection(section.id)}
                  className="px-2 py-1 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addSection}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            + Add Section
          </button>
        </div>
      )}

      {/* Completion Tab */}
      {activeTab === "completion" && (
        <div className="space-y-6">
          <h3 className="font-semibold">✅ Completion</h3>

          {/* Show correct answers */}
          <div>
            <label className="block text-sm text-gray-600">Show correct answers</label>
            <select
              value={showCorrectAnswers}
              onChange={(e) => setShowCorrectAnswers(e.target.value)}
              className="mt-1 block w-60 px-3 py-2 border rounded-md text-sm bg-gray-50"
            >
              <option>Always</option>
              <option>When passed</option>
              <option>When a test is passed</option>
              <option>When a test is failed</option>
            </select>
          </div>    

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGivenAnswers}
                onChange={() => setShowGivenAnswers(!showGivenAnswers)}
              />
              Show given answers
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={() => setShowLabels(!showLabels)}
              />
              Show correct/incorrect labels
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showScore}
                onChange={() => setShowScore(!showScore)}
              />
              Show score
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showStats}
                onChange={() => setShowStats(!showStats)}
              />
              Show stats after completion
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideCorrectQs}
                onChange={() => setHideCorrectQs(!hideCorrectQs)}
              />
              Hide questions answered correctly
            </label>
          </div>

          {/* Show feedback */}
          <div>
            <label className="block text-sm text-gray-600">Show feedback</label>
            <select
              value={showFeedback}
              onChange={(e) => setShowFeedback(e.target.value)}
              className="mt-1 block w-60 px-3 py-2 border rounded-md text-sm bg-gray-50"
            >
              <option>Always</option>
              <option>When a test is passed</option>
              <option>When a test is failed</option>
            </select>
          </div>

          {/* Behavior */}
          <div>
            <h3 className="font-semibold">↔ Behavior</h3>
            <div className="mt-2 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowMovement}
                  onChange={() => setAllowMovement(!allowMovement)}
                />
                Allow movement to next/previous question
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkAnswers}
                  onChange={() => setCheckAnswers(!checkAnswers)}
                />
                Check answers and do not continue until the correct answer is chosen
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={abandonOnFail}
                  onChange={() => setAbandonOnFail(!abandonOnFail)}
                />
                Abandon immediately whenever cannot pass
              </label>
            </div>
          </div>

          {/* Security */}
          <div>
            <h3 className="font-semibold">🔒 Security</h3>
            <div className="mt-2 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireSnapshot}
                  onChange={() => setRequireSnapshot(!requireSnapshot)}
                />
                Require learner snapshot to start the test
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requirePassword}
                  onChange={() => setRequirePassword(!requirePassword)}
                />
                Require password to start the test
              </label>
            </div>
          </div>

          {/* Message */}
          <div>
            <h3 className="font-semibold">💬 Message</h3>
            <label className="block text-sm text-gray-600">If passed</label>
            <textarea
              placeholder="Type your message here..."
              value={passMessage}
              onChange={(e) => setPassMessage(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md text-sm bg-gray-50"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
          Cancel
        </button>
      </div>
    </div>
  );
}
