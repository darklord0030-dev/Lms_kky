import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type QuestionType = "mcq" | "truefalse" | "typing";

interface MCQOption {
  id: number;
  text: string;
}

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options: MCQOption[];
  correct_answer: number | boolean | string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

/* -------------------------------------------------------------------------- */
/*                         LOCAL STORAGE HELPERS                              */
/* -------------------------------------------------------------------------- */

const LS_KEY = "test_system_quizzes";

const loadQuizzes = (): Quiz[] => {
  try {
    const data = localStorage.getItem(LS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveQuizzes = (quizzes: Quiz[]) => {
  localStorage.setItem(LS_KEY, JSON.stringify(quizzes));
};

/* -------------------------------------------------------------------------- */
/*                             MAIN COMPONENT                                 */
/* -------------------------------------------------------------------------- */

export default function Test() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(loadQuizzes());
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [createMode, setCreateMode] = useState(false);
  const [runMode, setRunMode] = useState<Quiz | null>(null);

  /* --------------------------- CRUD QUIZ METHODS -------------------------- */

  const createQuiz = () => {
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: "Untitled Quiz",
      description: "No description",
      questions: [],
    };

    const updated = [...quizzes, newQuiz];
    setQuizzes(updated);
    saveQuizzes(updated);

    setSelectedQuiz(newQuiz);
    setCreateMode(true);
  };

  const deleteQuiz = (id: string) => {
    const updated = quizzes.filter((q) => q.id !== id);
    setQuizzes(updated);
    saveQuizzes(updated);
    setSelectedQuiz(null);
    setCreateMode(false);
  };

  const updateQuiz = (quiz: Quiz) => {
    const updated = quizzes.map((q) => (q.id === quiz.id ? quiz : q));
    setQuizzes(updated);
    saveQuizzes(updated);
  };

  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Test / Quiz System</h1>

        {/* ------------------------------ LIST VIEW ------------------------------ */}
        {!createMode && !runMode && (
          <QuizList
            quizzes={quizzes}
            onCreate={createQuiz}
            onSelect={(q) => {
              setSelectedQuiz(q);
              setCreateMode(true);
            }}
            onRun={(q) => setRunMode(q)}
            onDelete={deleteQuiz}
          />
        )}

        {/* ------------------------------ BUILDER VIEW ------------------------------ */}
        {createMode && selectedQuiz && (
          <QuizBuilder
            quiz={selectedQuiz}
            onBack={() => setCreateMode(false)}
            onRun={(q) => setRunMode(q)}
            onUpdate={(q) => {
              setSelectedQuiz(q);
              updateQuiz(q);
            }}
          />
        )}

        {/* ------------------------------ RUNNER VIEW ------------------------------ */}
        {runMode && (
          <QuizRunner quiz={runMode} onExit={() => setRunMode(null)} />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               QUIZ LIST VIEW                               */
/* -------------------------------------------------------------------------- */

function QuizList({
  quizzes,
  onCreate,
  onSelect,
  onRun,
  onDelete,
}: {
  quizzes: Quiz[];
  onCreate: () => void;
  onSelect: (q: Quiz) => void;
  onRun: (q: Quiz) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <button
        onClick={onCreate}
        className="px-4 py-2 rounded-md bg-blue-600 text-white flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Create Quiz
      </button>

      {quizzes.length === 0 && (
        <p className="text-gray-500">No quizzes created yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="p-4 bg-white rounded-xl border">
            <h2 className="font-semibold text-lg">{quiz.title}</h2>
            <p className="text-sm text-gray-500">{quiz.description}</p>

            <div className="flex justify-between mt-4">
              <button
                className="text-blue-600 flex items-center gap-1"
                onClick={() => onSelect(quiz)}
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>

              <button
                className="text-green-600 flex items-center gap-1"
                onClick={() => onRun(quiz)}
              >
                <ChevronRight className="w-4 h-4" /> Start
              </button>

              <button
                className="text-red-500"
                onClick={() => onDelete(quiz.id)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               QUIZ BUILDER                                 */
/* -------------------------------------------------------------------------- */

function QuizBuilder({
  quiz,
  onBack,
  onRun,
  onUpdate,
}: {
  quiz: Quiz;
  onBack: () => void;
  onRun: (q: Quiz) => void;
  onUpdate: (quiz: Quiz) => void;
}) {
  const [local, setLocal] = useState<Quiz>(quiz);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const save = (updated: Quiz) => {
    setLocal(updated);
    onUpdate(updated);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      type: "mcq",
      question: "",
      options: [
        { id: 1, text: "" },
        { id: 2, text: "" },
      ],
      correct_answer: 1,
    };

    save({ ...local, questions: [...local.questions, newQuestion] });
    setEditingQuestion(newQuestion);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-gray-600 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* -------------------------- QUIZ TITLE / DESC ------------------------- */}
      <div className="space-y-2">
        <input
          className="w-full p-2 border rounded-md"
          placeholder="Quiz Title"
          value={local.title}
          onChange={(e) =>
            save({ ...local, title: e.target.value })
          }
        />
        <textarea
          className="w-full p-2 border rounded-md"
          placeholder="Quiz Description"
          value={local.description}
          onChange={(e) =>
            save({ ...local, description: e.target.value })
          }
        />
      </div>

      {/* ----------------------------- QUESTION LIST ----------------------------- */}
      <div className="space-y-3">
        <h3 className="font-semibold">Questions</h3>

        {local.questions.map((q) => (
          <div key={q.id} className="p-3 border rounded-xl bg-white flex justify-between">
            <div>
              <p className="font-medium">{q.question || "Untitled Question"}</p>
              <p className="text-xs text-gray-500">{q.type.toUpperCase()}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingQuestion(q)}
                className="text-blue-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  save({
                    ...local,
                    questions: local.questions.filter((x) => x.id !== q.id),
                  })
                }
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="mt-2 px-4 py-2 rounded-md bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      <button
        onClick={() => onRun(local)}
        className="px-4 py-2 rounded-md bg-green-600 text-white"
      >
        Start Quiz
      </button>

      {/* --------------------------- QUESTION EDITOR --------------------------- */}
      {editingQuestion && (
        <QuestionEditor
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={(q) => {
            save({
              ...local,
              questions: local.questions.map((x) =>
                x.id === q.id ? q : x
              ),
            });
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           QUESTION EDITOR (POPUP)                           */
/* -------------------------------------------------------------------------- */

function QuestionEditor({
  question,
  onSave,
  onClose,
}: {
  question: Question;
  onSave: (q: Question) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<Question>({ ...question });

  const update = (patch: Partial<Question>) =>
    setLocal({ ...local, ...patch });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-xl bg-white p-6 rounded-xl space-y-4 shadow-xl">
        <h3 className="text-xl font-semibold">Edit Question</h3>

        <select
          className="w-full p-2 border rounded-md"
          value={local.type}
          onChange={(e) =>
            update({
              type: e.target.value as QuestionType,
              options: e.target.value === "mcq" ? local.options : [],
              correct_answer:
                e.target.value === "truefalse" ? true : "",
            })
          }
        >
          <option value="mcq">MCQ</option>
          <option value="truefalse">True / False</option>
          <option value="typing">Typing</option>
        </select>

        <input
          className="w-full p-2 border rounded-md"
          placeholder="Question"
          value={local.question}
          onChange={(e) => update({ question: e.target.value })}
        />

        {/* MCQ OPTIONS */}
        {local.type === "mcq" && (
          <div className="space-y-2">
            {local.options.map((opt) => (
              <div key={opt.id} className="flex gap-2">
                <input
                  className="flex-1 p-2 border rounded-md"
                  value={opt.text}
                  onChange={(e) =>
                    update({
                      options: local.options.map((o) =>
                        o.id === opt.id
                          ? { ...o, text: e.target.value }
                          : o
                      ),
                    })
                  }
                />
                <input
                  type="radio"
                  checked={local.correct_answer === opt.id}
                  onChange={() => update({ correct_answer: opt.id })}
                />
              </div>
            ))}

            <button
              onClick={() =>
                update({
                  options: [
                    ...local.options,
                    {
                      id: Date.now(),
                      text: "",
                    },
                  ],
                })
              }
              className="px-3 py-1 bg-gray-200 rounded-md text-sm"
            >
              Add Option
            </button>
          </div>
        )}

        {/* TRUE / FALSE */}
        {local.type === "truefalse" && (
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={local.correct_answer === true}
                onChange={() => update({ correct_answer: true })}
              />
              True
            </label>

            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={local.correct_answer === false}
                onChange={() => update({ correct_answer: false })}
              />
              False
            </label>
          </div>
        )}

        {/* TYPING */}
        {local.type === "typing" && (
          <input
            className="w-full p-2 border rounded-md"
            placeholder="Correct Answer"
            value={local.correct_answer as string}
            onChange={(e) => update({ correct_answer: e.target.value })}
          />
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>
          <button
            onClick={() => onSave(local)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Save Question
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               QUIZ RUNNER                                  */
/* -------------------------------------------------------------------------- */

function QuizRunner({
  quiz,
  onExit,
}: {
  quiz: Quiz;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [finished, setFinished] = useState(false);

  const current = quiz.questions[index];

  const submit = () => setFinished(true);

  if (finished) {
    const correctCount = quiz.questions.filter((q) => {
      const user = answers[q.id];
      return (
        user === q.correct_answer ||
        (q.type === "typing" &&
          user?.toLowerCase() === (q.correct_answer as string).toLowerCase())
      );
    }).length;

    return (
      <div className="p-6 bg-white rounded-xl">
        <h2 className="text-xl font-semibold">Quiz Completed</h2>
        <p className="mt-2 text-gray-700">
          Score: {correctCount} / {quiz.questions.length}
        </p>

        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl space-y-4">
      <div className="flex justify-between">
        <button onClick={onExit} className="text-gray-600 flex items-center">
          <ChevronLeft className="w-4 h-4" /> Exit
        </button>
        <p>
          Question {index + 1} / {quiz.questions.length}
        </p>
      </div>

      <h3 className="font-semibold text-lg">{current.question}</h3>

      {/* ---------------------------- MCQ ---------------------------- */}
      {current.type === "mcq" &&
        current.options.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-2 border p-2 rounded-md"
          >
            <input
              type="radio"
              checked={answers[current.id] === opt.id}
              onChange={() =>
                setAnswers({ ...answers, [current.id]: opt.id })
              }
            />
            {opt.text}
          </label>
        ))}

      {/* ---------------------------- TRUE / FALSE ---------------------------- */}
      {current.type === "truefalse" && (
        <div className="flex gap-4">
          <label className="flex items-center gap-2 border p-2 rounded-md">
            <input
              type="radio"
              checked={answers[current.id] === true}
              onChange={() =>
                setAnswers({ ...answers, [current.id]: true })
              }
            />
            True
          </label>

          <label className="flex items-center gap-2 border p-2 rounded-md">
            <input
              type="radio"
              checked={answers[current.id] === false}
              onChange={() =>
                setAnswers({ ...answers, [current.id]: false })
              }
            />
            False
          </label>
        </div>
      )}

      {/* ---------------------------- TYPING ---------------------------- */}
      {current.type === "typing" && (
        <input
          className="w-full p-2 border rounded-md"
          placeholder="Your answer"
          value={answers[current.id] || ""}
          onChange={(e) =>
            setAnswers({ ...answers, [current.id]: e.target.value })
          }
        />
      )}

      <div className="flex justify-between pt-4">
        {index > 0 ? (
          <button
            onClick={() => setIndex(index - 1)}
            className="px-3 py-2 border rounded-md flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div />
        )}

        {index + 1 === quiz.questions.length ? (
          <button
            onClick={submit}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Finish Quiz
          </button>
        ) : (
          <button
            onClick={() => setIndex(index + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
