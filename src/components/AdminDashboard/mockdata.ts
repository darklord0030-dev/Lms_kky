import { User, Course, LearningActivity, Achievement, OverviewStats, ActivityEvent, TimelineData } from '../../types';

export const mockUser: User = {
  id: '1',
  email: 'kru@ymail.com',
  fullName: 'krunk krunk',
  role: 'superadmin',
};

export const mockCourses: Course[] = [
  {
    id: '1',
    name: 'What is TalentLibrary?',
    description: 'Introduction to TalentLibrary platform',
    status: 'not_started',
  },
];

export const mockLearningActivities: LearningActivity[] = [
  {
    id: '1',
    courseId: '1',
    name: 'What is TalentLibrary?',
    type: 'SCORM',
    courseName: 'What is TalentLibrary?',
    completionDate: undefined,
    progressStatus: 'Not attempted',
    score: undefined,
    trainingTime: undefined,
  },
];

export const mockAchievements: Achievement = {
  points: 50,
  badges: 0,
  level: 1,
};

export const mockOverviewStats: OverviewStats = {
  completionRate: 0.0,
  completedCourses: 0,
  coursesInProgress: 0,
  coursesNotPassed: 0,
  coursesNotStarted: 1,
  trainingTime: '0h 0m',
};

export const generateTimelineData = (events: ActivityEvent[]): TimelineData[] => {
  const dataMap = new Map<string, TimelineData>();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    dataMap.set(dateKey, {
      logins: 0,
      courseCompletions: 0,
      date: dateKey,
    });
  }

  events.forEach(event => {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    const existing = dataMap.get(dateKey);

    if (existing) {
      if (event.type === 'login') {
        existing.logins++;
      } else if (event.type === 'course_completion') {
        existing.courseCompletions++;
      }
    }
  });

  return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};
