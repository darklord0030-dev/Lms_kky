import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import BasicInfoForm from "./BasicInfoForm";
import CourseStructure from './CourseStructure';

import LessonConfiguration from './AdminCourse';

// ---------------------------
// REMOVED supabase import
// Added mock supabase object to avoid errors
// ---------------------------
const supabase = {
  storage: {
    from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "" } })
    })
  },
  from: () => ({
    insert: async () => ({ data: [], error: null, select: () => ({ single: async () => ({ data: {}, error: null }) }) }),
    update: async () => ({ error: null }),
    eq: () => ({})
  })
};

// ---------------------------
// FIX: Missing Types
// ---------------------------
interface Course {
  title: string;
  slug: string;
  small_description: string;
  description: string;
  thumbnail_url: string;
  category: string;
  level: string;
  duration: number;
  price: number;
  status: string;
}

interface Chapter {
  id: string;
  title: string;
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  order_index: number;
}

interface LessonConfigData {
  lessonName: string;
  description: string;
  videoFile?: File | null;
  thumbnailFile?: File | null;
}

function CourseApp() {
  const [currentPage, setCurrentPage] = useState<'course' | 'lesson'>('course');
  const [activeTab, setActiveTab] = useState<'basic' | 'structure'>('basic');

  const [courseData, setCourseData] = useState<Partial<Course>>({
    title: '',
    slug: '',
    small_description: '',
    description: '',
    thumbnail_url: '',
    category: 'Development',
    level: 'Beginner',
    duration: 0,
    price: 0,
    status: 'Draft'
  });

  const [chapters, setChapters] = useState<(Chapter & { lessons: Lesson[] })[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<{ chapterId: string; lessonId: string; title: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCourseUpdate = (data: Partial<Course>) => {
    setCourseData({ ...courseData, ...data });
  };

  const handleLessonSave = async (data: LessonConfigData) => {
    if (!selectedLesson) return;

    try {
      setIsSaving(true);

      let videoUrl = '';
      let thumbnailUrl = '';

      // ---------- Mock Video Upload ----------
      if (data.videoFile) {
        videoUrl = 'mock-video-url';
      }

      // ---------- Mock Thumbnail Upload ----------
      if (data.thumbnailFile) {
        thumbnailUrl = 'mock-thumbnail-url';
      }

      alert('Lesson configured successfully!');
      setSelectedLesson(null);
      setCurrentPage('course');
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Failed to save lesson.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      setIsSaving(true);

      // ---------- Mock Course Insert ----------
      const course = { id: 'mock-course-id' };

      if (course && chapters.length > 0) {
        // Mock chapters
        const insertedChapters = chapters.map((ch, index) => ({
          id: `mock-chapter-${index}`,
          ...ch
        }));

        // Mock lessons
        chapters.forEach((chapter, chapterIndex) => {
          chapter.lessons.forEach(() => {});
        });
      }

      alert('Course created successfully!');

      // Reset form
      setCourseData({
        title: '',
        slug: '',
        small_description: '',
        description: '',
        thumbnail_url: '',
        category: 'Development',
        level: 'Beginner',
        duration: 0,
        price: 0,
        status: 'Draft'
      });

      setChapters([]);
      setActiveTab('basic');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course.');
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------------------------
  // LESSON CONFIG PAGE
  // ------------------------------------
  if (currentPage === 'lesson' && selectedLesson) {
    return (
      <LessonConfiguration
        lessonId={selectedLesson.lessonId}
        lessonTitle={selectedLesson.title}
        onBack={() => {
          setSelectedLesson(null);
          setCurrentPage('course');
        }}
        onSave={handleLessonSave}
      />
    );
  }

  // ------------------------------------
  // MAIN PAGE
  // ------------------------------------
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Create Course</h1>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'text-white bg-gray-900 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              Basic Info
            </button>

            <button
              onClick={() => setActiveTab('structure')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'structure'
                  ? 'text-white bg-gray-900 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              Course Structure
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'basic' ? (
              <BasicInfoForm courseData={courseData} onUpdate={handleCourseUpdate} />
            ) : (
              <CourseStructure
                chapters={chapters}
                onUpdateChapters={setChapters}
                onLessonClick={(chapterId, lessonId, title) => {
                  setSelectedLesson({ chapterId, lessonId, title });
                  setCurrentPage('lesson');
                }}
              />
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCreateCourse}
            disabled={isSaving || !courseData.title || !courseData.slug}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              'Creating...'
            ) : (
              <>
                Create Course
                <Plus className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// FIX: Correct export
// ---------------------------
export default CourseApp;
