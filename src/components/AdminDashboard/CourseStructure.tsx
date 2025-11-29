import { useState } from 'react';
import {
  FileText,
  Trash2,
  Plus,
  CheckCircle
} from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  order_index: number;
}

interface CourseStructureProps {
  chapters: (Chapter & { lessons: Lesson[] })[];
  onUpdateChapters: (chapters: (Chapter & { lessons: Lesson[] })[]) => void;
  completedLessons?: string[];
  onLessonClick?: (chapterId: string, lessonId: string, title: string) => void;
}

export default function CourseStructure({
  chapters,
  onUpdateChapters,
  completedLessons = [],
  onLessonClick
}: CourseStructureProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    newExpanded.has(chapterId)
      ? newExpanded.delete(chapterId)
      : newExpanded.add(chapterId);
    setExpandedChapters(newExpanded);
  };

  const addChapter = () => {
    const newChapter: Chapter & { lessons: Lesson[] } = {
      id: `temp-${Date.now()}`,
      course_id: '',
      title: `Chapter ${chapters.length + 1}`,
      order_index: chapters.length,
      lessons: []
    };
    onUpdateChapters([...chapters, newChapter]);
    setExpandedChapters(new Set([...expandedChapters, newChapter.id]));
  };

  const addLesson = (chapterId: string) => {
    const updated = chapters.map(ch => {
      if (ch.id === chapterId) {
        const newLesson: Lesson = {
          id: `temp-${Date.now()}`,
          chapter_id: chapterId,
          title: `Lesson ${ch.lessons.length + 1}`,
          order_index: ch.lessons.length
        };
        return { ...ch, lessons: [...ch.lessons, newLesson] };
      }
      return ch;
    });
    onUpdateChapters(updated);
  };

  const deleteChapter = (chapterId: string) => {
    const updated = chapters
      .filter(ch => ch.id !== chapterId)
      .map((c, i) => ({ ...c, order_index: i }));
    onUpdateChapters(updated);
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    const updated = chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons
            .filter(l => l.id !== lessonId)
            .map((l, i) => ({ ...l, order_index: i }))
        };
      }
      return ch;
    });
    onUpdateChapters(updated);
  };

  const updateChapterTitle = (chapterId: string, title: string) => {
    onUpdateChapters(
      chapters.map(ch => (ch.id === chapterId ? { ...ch, title } : ch))
    );
  };

  const updateLessonTitle = (chapterId: string, lessonId: string, title: string) => {
    const updated = chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l =>
            l.id === lessonId ? { ...l, title } : l
          )
        };
      }
      return ch;
    });
    onUpdateChapters(updated);
  };

  const markAllLessonsComplete = (chapterId: string) => {
    const allLessonIds = chapters.find(ch => ch.id === chapterId)?.lessons.map(l => l.id) || [];
    allLessonIds.forEach(id => onLessonClick?.(chapterId, id, ""));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'chapter') {
      const newChapters = Array.from(chapters);
      const [removed] = newChapters.splice(source.index, 1);
      newChapters.splice(destination.index, 0, removed);
      onUpdateChapters(newChapters.map((ch, i) => ({ ...ch, order_index: i })));
    } else if (type.startsWith('lesson-')) {
      const chapterId = type.split('-')[1];
      const chapter = chapters.find(ch => ch.id === chapterId);
      if (!chapter) return;

      const newLessons = Array.from(chapter.lessons);
      const [removed] = newLessons.splice(source.index, 1);
      newLessons.splice(destination.index, 0, removed);

      onUpdateChapters(
        chapters.map(ch =>
          ch.id === chapterId
            ? { ...ch, lessons: newLessons.map((l, i) => ({ ...l, order_index: i })) }
            : ch
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Chapters</h3>
        <button
          onClick={addChapter}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-700 rounded-lg text-white text-sm font-medium transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          New chapter
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="chapters" type="chapter">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
              {chapters.map((ch, index) => {
                const completedCount = ch.lessons.filter(l => completedLessons.includes(l.id)).length;
                const totalLessons = ch.lessons.length;
                const chapterProgress = totalLessons ? (completedCount / totalLessons) * 100 : 0;

                return (
                  <Draggable key={ch.id} draggableId={ch.id} index={index}>
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center gap-3 p-4 hover:bg-gray-750 transition-colors">
                          <span {...provided.dragHandleProps} className="cursor-move">☰</span>

                          <input
                            type="text"
                            value={ch.title}
                            onChange={e => updateChapterTitle(ch.id, e.target.value)}
                            className="flex-1 bg-transparent text-white font-medium focus:outline-none"
                          />

                          <button
                            onClick={() => deleteChapter(ch.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => toggleChapter(ch.id)}
                            className="ml-2 text-gray-400 hover:text-white transition-colors"
                          >
                            {expandedChapters.has(ch.id) ? '▼' : '▶'}
                          </button>
                        </div>

                        {/* Chapter progress bar */}
                        <div className="px-4 pb-2">
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${chapterProgress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{completedCount} / {totalLessons} Lessons</span>
                            {totalLessons > 0 && (
                              <button
                                onClick={() => markAllLessonsComplete(ch.id)}
                                className="text-green-400 hover:text-green-300 transition-colors"
                              >
                                Mark all complete
                              </button>
                            )}
                          </div>
                        </div>

                        {expandedChapters.has(ch.id) && (
                          <Droppable droppableId={`lessons-${ch.id}`} type={`lesson-${ch.id}`}>
                            {provided => (
                              <div ref={provided.innerRef} {...provided.droppableProps} className="px-4 pb-4 space-y-2">
                                {ch.lessons.map((lesson, lIndex) => {
                                  const isCompleted = completedLessons.includes(lesson.id);
                                  return (
                                    <Draggable key={lesson.id} draggableId={lesson.id} index={lIndex}>
                                      {provided => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          onClick={() => onLessonClick?.(ch.id, lesson.id, lesson.title)}
                                          className={`flex items-center gap-3 p-3 rounded-lg ml-8 cursor-pointer transition-all duration-300
                                            ${isCompleted ? 'bg-green-900 text-green-300 line-through shadow-inner' : 'bg-gray-900 hover:bg-gray-850 text-gray-300 group-hover:text-white shadow hover:shadow-lg'}`}
                                        >
                                          {isCompleted && (
                                            <CheckCircle className="w-5 h-5 text-green-400 animate-bounce" />
                                          )}
                                          <FileText className="w-4 h-4" />

                                          <input
                                            type="text"
                                            value={lesson.title}
                                            onChange={e => updateLessonTitle(ch.id, lesson.id, e.target.value)}
                                            className={`flex-1 bg-transparent focus:outline-none
                                              ${isCompleted ? 'text-green-300 line-through' : 'text-gray-300 group-hover:text-white'}`}
                                          />

                                          <button
                                            onClick={e => {
                                              e.stopPropagation();
                                              deleteLesson(ch.id, lesson.id);
                                            }}
                                            className="text-gray-500 hover:text-red-400 transition-colors"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}

                                <button
                                  onClick={() => addLesson(ch.id)}
                                  className="flex items-center gap-2 px-4 py-2 ml-8 bg-gray-900 hover:bg-gray-850 rounded-lg text-gray-400 text-sm transition-colors w-full shadow hover:shadow-md"
                                >
                                  <Plus className="w-4 h-4" />
                                  New lesson
                                </button>
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
