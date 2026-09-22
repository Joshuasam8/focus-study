import { Subject, Task, Exam, FocusSession, ReminderItem, UserProfile, AppSettings } from '../types';

const STORAGE_KEYS = {
  USER: 'focusstudy_user',
  SUBJECTS: 'focusstudy_subjects',
  TASKS: 'focusstudy_tasks',
  EXAMS: 'focusstudy_exams',
  SESSIONS: 'focusstudy_sessions',
  REMINDERS: 'focusstudy_reminders',
  SETTINGS: 'focusstudy_settings',
  IS_AUTH: 'focusstudy_is_auth',
};

// Helper for relative date YYYY-MM-DD
export function getDateOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const DEFAULT_USER: UserProfile = {
  id: 'user-demo-1',
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  college: 'State University',
  major: 'Computer Science',
  dailyGoalHours: 4,
  xp: 1420,
  streak: 7,
  lastStudyDate: getDateOffset(0),
  isGuest: false,
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    name: 'Data Structures & Algorithms',
    code: 'CS 201',
    color: '#6366f1', // indigo
    icon: 'code-2',
    topics: ['Binary Trees', 'Graph Traversal', 'Dynamic Programming', 'Heaps & Priority Queues'],
  },
  {
    id: 'sub-2',
    name: 'Operating Systems',
    code: 'CS 304',
    color: '#10b981', // emerald
    icon: 'cpu',
    topics: ['Process Scheduling', 'Virtual Memory', 'Semaphores & Locks', 'Page Replacement'],
  },
  {
    id: 'sub-3',
    name: 'Database Management',
    code: 'CS 320',
    color: '#0ea5e9', // sky
    icon: 'database',
    topics: ['B+ Trees', 'Relational Algebra', 'Transactions & ACID', 'Indexing'],
  },
  {
    id: 'sub-4',
    name: 'Linear Algebra',
    code: 'MATH 215',
    color: '#f59e0b', // amber
    icon: 'sigma',
    topics: ['Eigenvalues & Eigenvectors', 'Matrix Factorization', 'Vector Spaces'],
  },
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    subjectId: 'sub-1',
    title: 'Review Binary Search Trees & AVL rotations',
    topic: 'Binary Trees',
    estimatedDuration: 45,
    actualDuration: 45,
    priority: 'high',
    dueDate: getDateOffset(0),
    dueTime: '11:00',
    completed: true,
    completedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    notes: 'Focus on balance factors and left/right double rotations.',
  },
  {
    id: 'task-2',
    subjectId: 'sub-1',
    title: 'Implement Dijkstra & BFS Graph traversal',
    topic: 'Graph Traversal',
    estimatedDuration: 60,
    priority: 'high',
    dueDate: getDateOffset(0),
    dueTime: '15:30',
    completed: false,
    notes: 'Solve LeetCode 743 and practice adjacency list memory layout.',
  },
  {
    id: 'task-3',
    subjectId: 'sub-2',
    title: 'Virtual Memory & Page Table simulation',
    topic: 'Virtual Memory',
    estimatedDuration: 45,
    priority: 'medium',
    dueDate: getDateOffset(0),
    dueTime: '18:00',
    completed: false,
    notes: 'Read Tanenbaum Chapter 3 slides on TLB misses.',
  },
  {
    id: 'task-4',
    subjectId: 'sub-3',
    title: 'Practice B+ Tree node split algorithms',
    topic: 'B+ Trees',
    estimatedDuration: 40,
    priority: 'medium',
    dueDate: getDateOffset(1),
    dueTime: '14:00',
    completed: false,
  },
  {
    id: 'task-5',
    subjectId: 'sub-4',
    title: 'Eigenvalues problem set #4',
    topic: 'Eigenvalues & Eigenvectors',
    estimatedDuration: 50,
    priority: 'low',
    dueDate: getDateOffset(2),
    dueTime: '17:00',
    completed: false,
  },
];

export const DEFAULT_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    name: 'Data Structures Midterm',
    subjectId: 'sub-1',
    date: getDateOffset(5),
    time: '09:00 AM',
    location: 'Engineering Hall 104',
    topics: ['Binary Trees', 'AVL Rotations', 'Graph Traversal', 'Priority Queues'],
    targetGrade: 'A',
  },
  {
    id: 'exam-2',
    name: 'Operating Systems Quiz 2',
    subjectId: 'sub-2',
    date: getDateOffset(11),
    time: '02:00 PM',
    location: 'Science Center 302',
    topics: ['Process Scheduling', 'Virtual Memory', 'Deadlocks'],
    targetGrade: 'A-',
  },
];

export const DEFAULT_SESSIONS: FocusSession[] = [
  // Today's completed session
  {
    id: 'sess-today-1',
    subjectId: 'sub-1',
    taskId: 'task-1',
    taskTitle: 'Review Binary Search Trees & AVL rotations',
    subjectName: 'Data Structures & Algorithms',
    durationMinutes: 45,
    completedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    xpEarned: 120,
    type: 'pomodoro',
  },
  {
    id: 'sess-today-2',
    subjectId: 'sub-2',
    taskTitle: 'Operating Systems Reading',
    subjectName: 'Operating Systems',
    durationMinutes: 45,
    completedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    xpEarned: 120,
    type: 'pomodoro',
  },
  {
    id: 'sess-today-3',
    subjectId: 'sub-1',
    taskTitle: 'Algorithm Problem Solving',
    subjectName: 'Data Structures & Algorithms',
    durationMinutes: 45,
    completedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    xpEarned: 120,
    type: 'pomodoro',
  },
  // Yesterday and earlier this week to populate weekly chart
  {
    id: 'sess-prev-1',
    subjectName: 'Data Structures & Algorithms',
    taskTitle: 'Graph Theory Foundations',
    durationMinutes: 60,
    completedAt: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
    xpEarned: 150,
    type: 'custom',
  },
  {
    id: 'sess-prev-2',
    subjectName: 'Database Management',
    taskTitle: 'SQL Joins & Grouping',
    durationMinutes: 90,
    completedAt: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
    xpEarned: 220,
    type: 'custom',
  },
  {
    id: 'sess-prev-3',
    subjectName: 'Linear Algebra',
    taskTitle: 'Matrix Orthogonality',
    durationMinutes: 120,
    completedAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    xpEarned: 280,
    type: 'custom',
  },
  {
    id: 'sess-prev-4',
    subjectName: 'Operating Systems',
    taskTitle: 'Multithreading & Mutexes',
    durationMinutes: 150,
    completedAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
    xpEarned: 350,
    type: 'custom',
  },
];

export const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Morning Focus Session',
    time: '09:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    type: 'study',
    enabled: true,
  },
  {
    id: 'rem-2',
    title: 'Exam Review Sprint',
    time: '16:00',
    days: ['Mon', 'Wed', 'Fri'],
    type: 'exam',
    enabled: true,
  },
  {
    id: 'rem-3',
    title: 'Hydration & Posture Break',
    time: '14:30',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    type: 'break',
    enabled: true,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  soundEnabled: true,
  ambientSound: 'none',
  ambientVolume: 0.5,
  autoStartBreaks: false,
  distractionAlertEnabled: true,
};

// Storage Accessors
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key} from storage:`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key} to storage:`, e);
  }
}

export function loadUser(): UserProfile {
  return loadFromStorage<UserProfile>(STORAGE_KEYS.USER, DEFAULT_USER);
}

export function saveUser(user: UserProfile): void {
  saveToStorage(STORAGE_KEYS.USER, user);
}

export function loadSubjects(): Subject[] {
  return loadFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
}

export function saveSubjects(subjects: Subject[]): void {
  saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
}

export function loadTasks(): Task[] {
  return loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
}

export function saveTasks(tasks: Task[]): void {
  saveToStorage(STORAGE_KEYS.TASKS, tasks);
}

export function loadExams(): Exam[] {
  return loadFromStorage<Exam[]>(STORAGE_KEYS.EXAMS, DEFAULT_EXAMS);
}

export function saveExams(exams: Exam[]): void {
  saveToStorage(STORAGE_KEYS.EXAMS, exams);
}

export function loadSessions(): FocusSession[] {
  return loadFromStorage<FocusSession[]>(STORAGE_KEYS.SESSIONS, DEFAULT_SESSIONS);
}

export function saveSessions(sessions: FocusSession[]): void {
  saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
}

export function loadReminders(): ReminderItem[] {
  return loadFromStorage<ReminderItem[]>(STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
}

export function saveReminders(reminders: ReminderItem[]): void {
  saveToStorage(STORAGE_KEYS.REMINDERS, reminders);
}

export function loadSettings(): AppSettings {
  return loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
}

export function isUserAuthenticated(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.IS_AUTH);
    return val === 'true';
  } catch {
    return false;
  }
}

export function setAuthenticated(val: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_AUTH, val ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function resetAllData(): void {
  localStorage.clear();
  setAuthenticated(true);
}

// Compute statistics
export function getTodayStudyMinutes(sessions: FocusSession[]): number {
  const today = new Date().toISOString().split('T')[0];
  return sessions
    .filter((s) => s.completedAt.startsWith(today))
    .reduce((acc, s) => acc + s.durationMinutes, 0);
}

export function getDaysRemaining(targetDateStr: string): number {
  const target = new Date(targetDateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  recommendedTaskId?: string;
  recommendedSubjectId?: string;
  suggestedDuration: number;
}

export function generateSmartSuggestions(
  tasks: Task[],
  exams: Exam[],
  subjects: Subject[]
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  // 1. Check impending exams
  const upcomingExams = exams
    .map((exam) => ({ exam, daysLeft: getDaysRemaining(exam.date) }))
    .filter((e) => e.daysLeft >= 0 && e.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (upcomingExams.length > 0) {
    const closest = upcomingExams[0];
    const examSubject = subjects.find((s) => s.id === closest.exam.subjectId);
    const subjectName = examSubject ? examSubject.name : closest.exam.name;

    // Find incomplete task matching this subject
    const relatedTask = tasks.find(
      (t) => !t.completed && (t.subjectId === closest.exam.subjectId || closest.exam.topics.includes(t.topic || ''))
    );

    if (relatedTask) {
      suggestions.push({
        id: 'sugg-exam-task',
        title: `Upcoming ${closest.exam.name} in ${closest.daysLeft} days`,
        description: `You have an exam approaching soon. Consider studying "${relatedTask.title}" today for ${relatedTask.estimatedDuration} minutes.`,
        recommendedTaskId: relatedTask.id,
        recommendedSubjectId: relatedTask.subjectId,
        suggestedDuration: relatedTask.estimatedDuration,
      });
    } else {
      const topicName = closest.exam.topics[0] || 'Core topics';
      suggestions.push({
        id: 'sugg-exam-prep',
        title: `${closest.exam.name} (${closest.daysLeft} days remaining)`,
        description: `Dedicate 45 minutes to revise "${topicName}" in ${subjectName} to stay ahead of your exam timeline.`,
        recommendedSubjectId: closest.exam.subjectId,
        suggestedDuration: 45,
      });
    }
  }

  // 2. High priority task check
  const highPriorityTask = tasks.find((t) => !t.completed && t.priority === 'high');
  if (highPriorityTask && (!suggestions.length || suggestions[0].recommendedTaskId !== highPriorityTask.id)) {
    const subject = subjects.find((s) => s.id === highPriorityTask.subjectId);
    suggestions.push({
      id: 'sugg-high-prio',
      title: 'High Priority Task Waiting',
      description: `Complete "${highPriorityTask.title}" (${subject?.name || 'Academic'}). Clear this first for maximum peace of mind.`,
      recommendedTaskId: highPriorityTask.id,
      recommendedSubjectId: highPriorityTask.subjectId,
      suggestedDuration: highPriorityTask.estimatedDuration,
    });
  }

  // 3. Fallback general suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'sugg-general',
      title: 'Power Pomodoro Sprint',
      description: 'Start a clean 25-minute focus session on any topic to build momentum for your daily goal.',
      suggestedDuration: 25,
    });
  }

  return suggestions;
}
