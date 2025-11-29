import { useEffect, useState } from 'react';
import { Clock, CheckCircle, FileText, Upload } from 'lucide-react';

// Local Assignment type (since Supabase removed)
export type Assignment = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number | null;
  submission_url?: string | null;
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  // 🔵 Replace Supabase call with mock async data
  const fetchAssignments = async () => {
    try {
      const mockData: Assignment[] = [
        {
          id: '1',
          course_id: '101',
          title: 'Sample Assignment',
          description: 'Write a small essay about web development.',
          due_date: new Date().toISOString(),
          status: 'pending',
          grade: null,
        },
      ];

      setAssignments(mockData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Simulate submitting assignment
  const handleSubmit = async (assignmentId: string) => {
    try {
      const updated = assignments.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              status: 'submitted',
              submission_url: 'https://example.com/submission',
            }
          : a
      );

      setAssignments(updated);
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  // 🔵 Simulate grading
  const handleGrade = async (assignmentId: string) => {
    const randomGrade = Math.floor(Math.random() * 20) + 80;

    try {
      const updated = assignments.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              status: 'graded',
              grade: randomGrade,
            }
          : a
      );

      setAssignments(updated);
    } catch (error) {
      console.error('Error grading assignment:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'submitted':
        return <Upload size={20} className="text-blue-600" />;
      default:
        return <Clock size={20} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Assignments</h1>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(assignment.status)}
                  <h3 className="text-lg font-semibold">{assignment.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      assignment.status
                    )}`}
                  >
                    {assignment.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">{assignment.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText size={16} />
                    Assignment
                  </span>

                  <span>
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </span>

                  {assignment.grade !== null && assignment.grade !== undefined && (
                    <span className="font-semibold text-green-600">
                      Grade: {assignment.grade}/100
                    </span>
                  )}
                </div>
              </div>

              <div className="ml-4">
                {assignment.status === 'pending' && (
                  <button
                    onClick={() => handleSubmit(assignment.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Submit
                  </button>
                )}

                {assignment.status === 'submitted' && (
                  <button
                    onClick={() => handleGrade(assignment.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Grade
                  </button>
                )}

                {assignment.status === 'graded' && (
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg cursor-not-allowed">
                    Graded
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No assignments available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
