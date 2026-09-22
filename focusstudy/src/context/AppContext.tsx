import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserDoc, Task, Subject, StudySession, Exam } from '../types';

interface AppContextType {
  currentUser: User | null;
  isGuest: boolean;
  userProfile: UserDoc | null;
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];
  exams: Exam[];
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  // Auth methods
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (name: string, email: string, pass: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  resetPassword: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  // Data methods
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  addSubject: (name: string, color: string, chapters: string[]) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  addExam: (exam: Omit<Exam, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteExam: (examId: string) => Promise<void>;
  recordStudySession: (session: {
    subject: string;
    topic: string;
    targetDuration: number;
    actualDuration: number;
    completed: boolean;
    interruptionsCount: number;
    xpEarned: number;
  }) => Promise<void>;
  updateDailyGoal: (minutes: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_SUBJECTS: Omit<Subject, 'id' | 'userId'>[] = [
  {
    name: 'Data Structures & Algorithms',
    color: '#3B82F6', // Blue
    chapters: ['Trees', 'Graphs', 'Sorting', 'Dynamic Programming'],
  },
  {
    name: 'Computer Systems',
    color: '#10B981', // Emerald
    chapters: ['Memory Hierarchy', 'Concurrency', 'Pipelining', 'Virtual Memory'],
  },
  {
    name: 'Discrete Mathematics',
    color: '#F59E0B', // Amber
    chapters: ['Graph Theory', 'Combinatorics', 'Proof by Induction'],
  },
];

const INITIAL_GUEST_USER: UserDoc = {
  name: 'Student Scholar',
  email: 'guest@focusstudy.local',
  dailyGoal: 240, // 4 hours in minutes
  totalXP: 150,
  currentStreak: 3,
  longestStreak: 5,
  lastStudyDate: new Date().toISOString().split('T')[0],
};

const GUEST_STORAGE_KEY = 'focusstudy_guest_data_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('focusstudy_is_guest') === 'true';
  });
  const [userProfile, setUserProfile] = useState<UserDoc | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Load guest data from localStorage
  const loadGuestData = () => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserProfile(parsed.userProfile || INITIAL_GUEST_USER);
        setTasks(parsed.tasks || []);
        setSubjects(parsed.subjects || []);
        setStudySessions(parsed.studySessions || []);
        setExams(parsed.exams || []);
      } else {
        setUserProfile(INITIAL_GUEST_USER);
        const sampleSubjects: Subject[] = DEFAULT_SUBJECTS.map((s, idx) => ({
          ...s,
          id: `guest_sub_${idx}`,
          userId: 'guest',
        }));
        const todayStr = new Date().toISOString().split('T')[0];
        const sampleTasks: Task[] = [
          {
            id: 'guest_task_1',
            userId: 'guest',
            subject: 'Data Structures & Algorithms',
            chapter: 'Trees',
            title: 'Binary Search Tree traversal & balance invariants',
            date: todayStr,
            time: '14:00',
            priority: 'high',
            estimatedDuration: 45,
            completed: false,
          },
          {
            id: 'guest_task_2',
            userId: 'guest',
            subject: 'Data Structures & Algorithms',
            chapter: 'Graphs',
            title: 'Dijkstra shortest path algorithm review',
            date: todayStr,
            time: '16:30',
            priority: 'medium',
            estimatedDuration: 60,
            completed: false,
          },
          {
            id: 'guest_task_3',
            userId: 'guest',
            subject: 'Computer Systems',
            chapter: 'Memory Hierarchy',
            title: 'L1/L2 Cache miss penalty calculations',
            date: todayStr,
            time: '19:00',
            priority: 'low',
            estimatedDuration: 30,
            completed: true,
          },
        ];
        const sampleExams: Exam[] = [
          {
            id: 'guest_exam_1',
            userId: 'guest',
            subject: 'Data Structures & Algorithms',
            title: 'Midterm Examination',
            date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
            time: '10:00',
          },
        ];
        setSubjects(sampleSubjects);
        setTasks(sampleTasks);
        setExams(sampleExams);
        setStudySessions([
          {
            id: 'guest_sess_1',
            userId: 'guest',
            subject: 'Computer Systems',
            topic: 'L1/L2 Cache Misses',
            targetDuration: 30,
            actualDuration: 30,
            completed: true,
            interruptionsCount: 0,
            xpEarned: 30,
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error('Failed to load guest data:', e);
      setUserProfile(INITIAL_GUEST_USER);
    }
  };

  const saveGuestData = (
    up = userProfile,
    t = tasks,
    s = subjects,
    ss = studySessions,
    e = exams
  ) => {
    if (!isGuest) return;
    try {
      localStorage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify({
          userProfile: up,
          tasks: t,
          subjects: s,
          studySessions: ss,
          exams: e,
        })
      );
    } catch (err) {
      console.warn('Could not persist guest storage:', err);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user) {
          setIsGuest(false);
          localStorage.removeItem('focusstudy_is_guest');
          setCurrentUser(user);
          // Fetch or create user profile in Firestore
          const userRef = doc(db, 'users', user.uid);
          try {
            const snapshot = await getDoc(userRef);
            if (snapshot.exists()) {
              setUserProfile(snapshot.data() as UserDoc);
            } else {
              const newProfile: UserDoc = {
                name: user.displayName || user.email?.split('@')[0] || 'Student',
                email: user.email || '',
                dailyGoal: 240,
                totalXP: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };
              await setDoc(userRef, newProfile);
              setUserProfile(newProfile);

              // Populate initial default subjects for new user
              for (const sub of DEFAULT_SUBJECTS) {
                const subRef = doc(collection(db, 'subjects'));
                await setDoc(subRef, {
                  ...sub,
                  userId: user.uid,
                  createdAt: serverTimestamp(),
                });
              }
            }
          } catch (error) {
            console.error('Failed to sync user profile with Firestore:', error);
            // Fallback user profile in memory so the app functions smoothly
            setUserProfile({
              name: user.displayName || user.email?.split('@')[0] || 'Student',
              email: user.email || '',
              dailyGoal: 240,
              totalXP: 0,
              currentStreak: 0,
              longestStreak: 0,
              lastStudyDate: '',
            });
            try {
              handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
            } catch (handled) {
              console.warn('Profile fetch logged:', handled);
            }
          }
        } else {
          setCurrentUser(null);
          if (isGuest) {
            loadGuestData();
          } else {
            setUserProfile(null);
            setTasks([]);
            setSubjects([]);
            setStudySessions([]);
            setExams([]);
          }
        }
      } catch (err) {
        console.error('Auth state resolution encountered an error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isGuest]);

  // Firestore listeners for real authenticated users
  useEffect(() => {
    if (!currentUser || isGuest) return;
    const uid = currentUser.uid;

    // Listen to user document
    const unsubUser = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserDoc);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    });

    // Listen to tasks
    const tasksQ = query(collection(db, 'tasks'), where('userId', '==', uid));
    const unsubTasks = onSnapshot(tasksQ, (snapshot) => {
      const items: Task[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      setTasks(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    // Listen to subjects
    const subjectsQ = query(collection(db, 'subjects'), where('userId', '==', uid));
    const unsubSubjects = onSnapshot(subjectsQ, (snapshot) => {
      const items: Subject[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
      setSubjects(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'subjects');
    });

    // Listen to studySessions
    const sessionsQ = query(collection(db, 'studySessions'), where('userId', '==', uid));
    const unsubSessions = onSnapshot(sessionsQ, (snapshot) => {
      const items: StudySession[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as StudySession));
      // Sort newest first
      items.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setStudySessions(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'studySessions');
    });

    // Listen to exams
    const examsQ = query(collection(db, 'exams'), where('userId', '==', uid));
    const unsubExams = onSnapshot(examsQ, (snapshot) => {
      const items: Exam[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
      // Sort by exam date
      items.sort((a, b) => a.date.localeCompare(b.date));
      setExams(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'exams');
    });

    return () => {
      unsubUser();
      unsubTasks();
      unsubSubjects();
      unsubSessions();
      unsubExams();
    };
  }, [currentUser, isGuest]);

  // Auth Handlers
  const signInEmail = async (email: string, pass: string) => {
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setAuthError(msg);
      throw err;
    }
  };

  const signUpEmail = async (name: string, email: string, pass: string) => {
    try {
      setAuthError(null);
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const userRef = doc(db, 'users', cred.user.uid);
      const newProfile: UserDoc = {
        name,
        email,
        dailyGoal: 240,
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);
      setUserProfile(newProfile);

      // Default subjects
      for (const sub of DEFAULT_SUBJECTS) {
        const subRef = doc(collection(db, 'subjects'));
        await setDoc(subRef, {
          ...sub,
          userId: cred.user.uid,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setAuthError(msg);
      throw err;
    }
  };

  const signInGoogle = async () => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      setAuthError(msg);
      throw err;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('focusstudy_is_guest', 'true');
    loadGuestData();
  };

  const resetPassword = async (email: string) => {
    try {
      setAuthError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      setAuthError(msg);
      throw err;
    }
  };

  const logOut = async () => {
    if (isGuest) {
      setIsGuest(false);
      localStorage.removeItem('focusstudy_is_guest');
      setUserProfile(null);
    } else {
      await signOut(auth);
    }
  };

  // Task Operations
  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {
    if (isGuest) {
      const newTask: Task = {
        ...taskData,
        id: `guest_task_${Date.now()}`,
        userId: 'guest',
        createdAt: new Date().toISOString(),
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      saveGuestData(userProfile, updated, subjects, studySessions, exams);
      return;
    }

    if (!currentUser) return;
    try {
      const colRef = collection(db, 'tasks');
      await addDoc(colRef, {
        ...taskData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (isGuest) {
      const updated = tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t));
      setTasks(updated);
      saveGuestData(userProfile, updated, subjects, studySessions, exams);
      return;
    }

    if (!currentUser) return;
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (isGuest) {
      const updated = tasks.filter(t => t.id !== taskId);
      setTasks(updated);
      saveGuestData(userProfile, updated, subjects, studySessions, exams);
      return;
    }

    if (!currentUser) return;
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await updateTask(taskId, { completed: !task.completed });
  };

  // Subject Operations
  const addSubject = async (name: string, color: string, chapters: string[]) => {
    if (isGuest) {
      const newSub: Subject = {
        id: `guest_sub_${Date.now()}`,
        userId: 'guest',
        name,
        color,
        chapters,
        createdAt: new Date().toISOString(),
      };
      const updated = [...subjects, newSub];
      setSubjects(updated);
      saveGuestData(userProfile, tasks, updated, studySessions, exams);
      return;
    }

    if (!currentUser) return;
    try {
      const colRef = collection(db, 'subjects');
      await addDoc(colRef, {
        userId: currentUser.uid,
        name,
        color,
        chapters,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'subjects');
    }
  };

  const deleteSubject = async (subjectId: string) => {
    if (isGuest) {
      const updated = subjects.filter(s => s.id !== subjectId);
      setSubjects(updated);
      saveGuestData(userProfile, tasks, updated, studySessions, exams);
      return;
    }

    if (!currentUser) return;
    try {
      const subRef = doc(db, 'subjects', subjectId);
      await deleteDoc(subRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `subjects/${subjectId}`);
    }
  };

  // Exam Operations
  const addExam = async (examData: Omit<Exam, 'id' | 'userId' | 'createdAt'>) => {
    if (isGuest) {
      const newExam: Exam = {
        ...examData,
        id: `guest_exam_${Date.now()}`,
        userId: 'guest',
        createdAt: new Date().toISOString(),
      };
      const updated = [...exams, newExam];
      setExams(updated);
      saveGuestData(userProfile, tasks, subjects, studySessions, updated);
      return;
    }

    if (!currentUser) return;
    try {
      const colRef = collection(db, 'exams');
      await addDoc(colRef, {
        ...examData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'exams');
    }
  };

  const deleteExam = async (examId: string) => {
    if (isGuest) {
      const updated = exams.filter(e => e.id !== examId);
      setExams(updated);
      saveGuestData(userProfile, tasks, subjects, studySessions, updated);
      return;
    }

    if (!currentUser) return;
    try {
      const examRef = doc(db, 'exams', examId);
      await deleteDoc(examRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `exams/${examId}`);
    }
  };

  // Record Focus Study Session & Update Habits/Streaks
  const recordStudySession = async (sessionData: {
    subject: string;
    topic: string;
    targetDuration: number;
    actualDuration: number;
    completed: boolean;
    interruptionsCount: number;
    xpEarned: number;
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Calculate updated streak
    let newStreak = userProfile?.currentStreak || 0;
    if (userProfile?.lastStudyDate === today) {
      // Already studied today, maintain streak
    } else if (userProfile?.lastStudyDate === yesterday) {
      newStreak += 1;
    } else {
      // Missed a day or first session
      newStreak = 1;
    }

    const newLongestStreak = Math.max(userProfile?.longestStreak || 0, newStreak);
    const updatedXP = (userProfile?.totalXP || 0) + sessionData.xpEarned;

    if (isGuest) {
      const newSession: StudySession = {
        ...sessionData,
        id: `guest_sess_${Date.now()}`,
        userId: 'guest',
        createdAt: new Date().toISOString(),
      };
      const updatedSessions = [newSession, ...studySessions];
      const updatedProfile: UserDoc = {
        ...(userProfile || INITIAL_GUEST_USER),
        totalXP: updatedXP,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastStudyDate: today,
      };

      setStudySessions(updatedSessions);
      setUserProfile(updatedProfile);
      saveGuestData(updatedProfile, tasks, subjects, updatedSessions, exams);
      return;
    }

    if (!currentUser) return;
    try {
      // 1. Add session record
      const colRef = collection(db, 'studySessions');
      await addDoc(colRef, {
        ...sessionData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // 2. Update user profile stats
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        totalXP: updatedXP,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastStudyDate: today,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'studySessions');
    }
  };

  const updateDailyGoal = async (minutes: number) => {
    if (isGuest) {
      if (!userProfile) return;
      const updated = { ...userProfile, dailyGoal: minutes };
      setUserProfile(updated);
      saveGuestData(updated, tasks, subjects, studySessions, exams);
      return;
    }

    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        dailyGoal: minutes,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      isGuest,
      userProfile,
      tasks,
      subjects,
      studySessions,
      exams,
      loading,
      authError,
      clearAuthError,
      signInEmail,
      signUpEmail,
      signInGoogle,
      continueAsGuest,
      resetPassword,
      logOut,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      addSubject,
      deleteSubject,
      addExam,
      deleteExam,
      recordStudySession,
      updateDailyGoal,
    }),
    [currentUser, isGuest, userProfile, tasks, subjects, studySessions, exams, loading, authError]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
