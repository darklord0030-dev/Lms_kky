export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'admin' | 'superadmin';
  avatarUrl?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'not_passed';
}

export interface LearningActivity {
  id: string;
  courseId: string;
  name: string;
  type: string;
  courseName: string;
  completionDate?: string;
  progressStatus: string;
  score?: string;
  trainingTime?: string;
}

export interface Achievement {
  points: number;
  badges: number;
  level: number;
}

export interface OverviewStats {
  completionRate: number;
  completedCourses: number;
  coursesInProgress: number;
  coursesNotPassed: number;
  coursesNotStarted: number;
  trainingTime: string;
}

export interface ActivityEvent {
  id: string;
  type: 'login' | 'course_completion' | 'activity_start' | 'activity_complete' | 'badge_earned';
  timestamp: Date;
  metadata?: any;
}

export interface TimelineData {
  logins: number;
  courseCompletions: number;
  date: string;
}
