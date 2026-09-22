export interface UserDoc {
  name: string;
  email: string;
  dailyGoal: number; // in minutes (e.g., 240 for 4 hours)
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  createdAt?: any;
  updatedAt?: any;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  subject: string;
  chapter: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  priority: TaskPriority;
  estimatedDuration: number; // in minutes
  completed: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;
  chapters: string[];
  createdAt?: any;
}

export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  targetDuration: number; // minutes
  actualDuration: number; // minutes
  completed: boolean;
  interruptionsCount: number;
  xpEarned: number;
  createdAt: any;
}

export interface Exam {
  id: string;
  userId: string;
  subject: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  createdAt?: any;
}

export interface DistractionSettings {
  notifications: boolean;
  calls: boolean;
  appDistractions: boolean;
}

export type AmbientSoundType = 'none' | 'rain' | 'white-noise' | 'binaural';
