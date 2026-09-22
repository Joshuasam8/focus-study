import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  Trash2,
  Layers,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { Subject, Task, Priority } from '../types';

interface PlannerScreenProps {
  subjects: Subject[];
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onStartFocus: (taskId: string) => void;
}

const COLOR_OPTIONS = ['#6366f1', '#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export const PlannerScreen: React.FC<PlannerScreenProps> = ({
  subjects,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddSubject,
  onStartFocus,
}) => {
  const [activeFilterSubject, setActiveFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // New Task Form State
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTopic, setTaskTopic] = useState('');
  const [taskDuration, setTaskDuration] = useState(45);
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueTime, setTaskDueTime] = useState('14:00');
  const [taskNotes, setTaskNotes] = useState('');

  // New Subject Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubColor, setNewSubColor] = useState(COLOR_OPTIONS[0]);
  const [newSubTopics, setNewSubTopics] = useState('');

  // Selected subject topics for the dropdown
  const currentFormSubject = subjects.find((s) => s.id === taskSubjectId);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskSubjectId) return;

    onAddTask({
      subjectId: taskSubjectId,
      title: taskTitle.trim(),
      topic: taskTopic.trim() || undefined,
      estimatedDuration: Number(taskDuration) || 45,
      priority: taskPriority,
      dueDate: taskDueDate,
      dueTime: taskDueTime || undefined,
      completed: false,
      notes: taskNotes.trim() || undefined,
    });

    setTaskTitle('');
    setTaskTopic('');
    setTaskNotes('');
    setIsTaskModalOpen(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const topicsArray = newSubTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onAddSubject({
      name: newSubName.trim(),
      code: newSubCode.trim() || undefined,
      color: newSubColor,
      icon: 'book-open',
      topics: topicsArray.length > 0 ? topicsArray : ['General Topics'],
    });

    setNewSubName('');
    setNewSubCode('');
    setNewSubTopics('');
    setIsSubjectModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (activeFilterSubject !== 'all' && task.subjectId !== activeFilterSubject) return false;
    if (filterStatus === 'pending' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    return true;
  });

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Course Management
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Study Planner
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          >
            + Subject
          </button>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
        </div>
      </div>

      {/* Subjects Horizontal Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>YOUR SUBJECTS ({subjects.length})</span>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveFilterSubject('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition border ${
              activeFilterSubject === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            All Courses
          </button>
          {subjects.map((sub) => {
            const isSelected = activeFilterSubject === sub.id;
            const subTasksCount = tasks.filter((t) => t.subjectId === sub.id && !t.completed).length;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveFilterSubject(sub.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: sub.color }}
                />
                <span className="truncate max-w-[120px]">{sub.name}</span>
                {subTasksCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {subTasksCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs: Pending / Completed */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
        {(['all', 'pending', 'completed'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition ${
              filterStatus === st
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Task List (Grouped by Subject) */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No tasks found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add chapters or topics to study for your upcoming exams.
            </p>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const subject = subjects.find((s) => s.id === task.subjectId);
            const priorityBadge =
              task.priority === 'high'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/60'
                : task.priority === 'medium'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';

            return (
              <div
                key={task.id}
                className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border transition space-y-3 ${
                  task.completed
                    ? 'border-slate-200/60 dark:border-slate-800 opacity-60'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition shrink-0 mt-0.5 ${
                        task.completed
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {subject && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: subject.color }}
                          />
                        )}
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                          {subject?.name || 'General'}
                        </span>
                        {task.topic && (
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                            • {task.topic}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-bold text-slate-900 dark:text-white leading-snug ${
                          task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${priorityBadge}`}
                  >
                    {task.priority}
                  </span>
                </div>

                {/* Task Footer Meta & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{task.estimatedDuration} mins</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{task.dueDate}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!task.completed && (
                      <button
                        onClick={() => onStartFocus(task.id)}
                        className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Focus</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Task */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Create Study Task
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={taskSubjectId}
                  onChange={(e) => setTaskSubjectId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code || 'No Code'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title * (e.g. Trees Problem Set, LeetCode Graphs)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trees – AVL Rotations & Balancing"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter / Topic (Optional)
                </label>
                {currentFormSubject?.topics && currentFormSubject.topics.length > 0 ? (
                  <select
                    value={taskTopic}
                    onChange={(e) => setTaskTopic(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium mb-1"
                  >
                    <option value="">Select a topic from syllabus...</option>
                    {currentFormSubject.topics.map((top) => (
                      <option key={top} value={top}>
                        {top}
                      </option>
                    ))}
                  </select>
                ) : null}
                <input
                  type="text"
                  placeholder="Or type custom topic..."
                  value={taskTopic}
                  onChange={(e) => setTaskTopic(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    step="5"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(Number(e.target.value))}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Time
                  </label>
                  <input
                    type="time"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Study Notes / Key Objectives
                </label>
                <textarea
                  rows={2}
                  placeholder="Key theorems to memorize, textbook page numbers..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-sm mt-4"
              >
                Add Study Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Subject */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Subject / Course
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discrete Mathematics"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. MATH 130"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewSubColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newSubColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chapters / Topics (Comma separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="Set Theory, Combinatorics, Graph Induction"
                  value={newSubTopics}
                  onChange={(e) => setNewSubTopics(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-sm mt-4"
              >
                Save Course
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
