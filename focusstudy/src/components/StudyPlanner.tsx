import React, { useState } from 'react';
import {
  Plus,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit2,
  Filter,
  Play,
  Layers,
  ChevronDown,
  Calendar,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority } from '../types';

interface StudyPlannerProps {
  onFocusTask: (task: Task) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ onFocusTask }) => {
  const { tasks, subjects, addTask, updateTask, deleteTask, toggleTaskComplete, addSubject, deleteSubject } = useApp();

  // Filters
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Task creation/edit modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskSubject, setTaskSubject] = useState<string>('');
  const [taskChapter, setTaskChapter] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDate, setTaskDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [taskTime, setTaskTime] = useState<string>('14:00');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDuration, setTaskDuration] = useState<number>(45);

  // Subject creation modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newSubjectColor, setNewSubjectColor] = useState<string>('#3B82F6');
  const [newSubjectChapters, setNewSubjectChapters] = useState<string>('');

  const openNewTaskModal = (defaultSubject?: string) => {
    setEditingTask(null);
    setTaskSubject(defaultSubject || (subjects.length > 0 ? subjects[0].name : 'Data Structures'));
    setTaskChapter('');
    setTaskTitle('');
    setTaskDate(new Date().toISOString().split('T')[0]);
    setTaskTime('14:00');
    setTaskPriority('medium');
    setTaskDuration(45);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskSubject(task.subject);
    setTaskChapter(task.chapter || '');
    setTaskTitle(task.title);
    setTaskDate(task.date);
    setTaskTime(task.time || '14:00');
    setTaskPriority(task.priority);
    setTaskDuration(task.estimatedDuration);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskSubject.trim()) return;

    if (editingTask) {
      await updateTask(editingTask.id, {
        subject: taskSubject,
        chapter: taskChapter,
        title: taskTitle,
        date: taskDate,
        time: taskTime,
        priority: taskPriority,
        estimatedDuration: Number(taskDuration),
      });
    } else {
      await addTask({
        subject: taskSubject,
        chapter: taskChapter,
        title: taskTitle,
        date: taskDate,
        time: taskTime,
        priority: taskPriority,
        estimatedDuration: Number(taskDuration),
        completed: false,
      });
    }
    setIsTaskModalOpen(false);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const chapters = newSubjectChapters
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    await addSubject(newSubjectName.trim(), newSubjectColor, chapters);
    setNewSubjectName('');
    setNewSubjectChapters('');
    setIsSubjectModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedSubjectFilter !== 'all' && t.subject !== selectedSubjectFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (statusFilter === 'active' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    return true;
  });

  // Group tasks by subject
  const subjectGroups = subjects.map((sub) => {
    const subTasks = filteredTasks.filter((t) => t.subject === sub.name);
    return {
      subject: sub,
      tasks: subTasks,
    };
  });

  // Tasks with unlisted subject or when filtering
  const ungroupedTasks = filteredTasks.filter(
    (t) => !subjects.some((s) => s.name === t.subject)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Study Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize courses, prioritize chapters, and plan deep focus sessions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Add Subject</span>
          </button>

          <button
            onClick={() => openNewTaskModal()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-indigo-200 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Study Task</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 text-slate-400 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Task List: Grouped by Subject strictly matching user's requested format */}
      <div className="space-y-6">
        {subjectGroups.map(({ subject, tasks: subTasks }) => {
          if (selectedSubjectFilter !== 'all' && selectedSubjectFilter !== subject.name) {
            return null;
          }

          return (
            <div
              key={subject.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
            >
              {/* Subject Title Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subject.color || '#3B82F6' }}
                  />
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                      <span>📚 {subject.name}</span>
                    </h2>
                    {subject.chapters && subject.chapters.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {subject.chapters.map((chap) => (
                          <span
                            key={chap}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                          >
                            {chap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openNewTaskModal(subject.name)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50"
                  >
                    + Add Task
                  </button>
                  <button
                    onClick={() => deleteSubject(subject.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subject Tasks */}
              {subTasks.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  No tasks under this subject matching filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {subTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        task.completed
                          ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                          : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xs'
                      }`}
                    >
                      {/* Left: Checkbox & Topic Details */}
                      <div className="flex items-start space-x-3.5 min-w-0">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500" />
                          )}
                        </button>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {task.chapter && (
                              <span className="font-bold text-slate-800 text-sm">
                                {task.chapter}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                task.priority === 'high'
                                  ? 'bg-rose-100 text-rose-800'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {task.priority} Priority
                            </span>
                            <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.estimatedDuration} minutes</span>
                            </span>
                          </div>

                          <p
                            className={`text-sm font-medium ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            {task.title}
                          </p>

                          {task.date && (
                            <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due {task.date} {task.time ? `at ${task.time}` : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        {!task.completed && (
                          <button
                            onClick={() => onFocusTask(task)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center space-x-1.5"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Focus Mode 🎯</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditTaskModal(task)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Ungrouped Tasks if any */}
        {ungroupedTasks.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-slate-900">General Study Tasks</h2>
            <div className="space-y-3">
              {ungroupedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <button onClick={() => toggleTaskComplete(task.id)}>
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500">
                        {task.estimatedDuration}m • {task.priority}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onFocusTask(task)}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs"
                  >
                    Focus 🎯
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Modal (Create & Edit) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTask ? 'Edit Study Task' : 'New Study Task'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Subject */}
              <div className="space-y-1">
                <label className="uppercase tracking-wider">Subject / Course</label>
                <select
                  value={taskSubject}
                  onChange={(e) => {
                    setTaskSubject(e.target.value);
                    const subObj = subjects.find((s) => s.name === e.target.value);
                    if (subObj && subObj.chapters && subObj.chapters.length > 0) {
                      setTaskChapter(subObj.chapters[0]);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                  {subjects.length === 0 && (
                    <option value="General Studies">General Studies</option>
                  )}
                </select>
              </div>

              {/* Chapter / Topic */}
              <div className="space-y-1">
                <label className="uppercase tracking-wider">Chapter or Sub-topic</label>
                <input
                  type="text"
                  placeholder="e.g. Trees, Sorting, Memory Hierarchy"
                  value={taskChapter}
                  onChange={(e) => setTaskChapter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Task Title */}
              <div className="space-y-1">
                <label className="uppercase tracking-wider">Specific Study Goal / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Red-Black tree insertion & rotation"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Priority & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Estimated Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    step="5"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Planned Date</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Planned Time</label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Subject / Course</h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="uppercase tracking-wider">Course / Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems, Linear Algebra"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase tracking-wider">Chapters or Topics (comma separated)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Page Replacement, Scheduling, Virtual Memory"
                  value={newSubjectChapters}
                  onChange={(e) => setNewSubjectChapters(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase tracking-wider">Color Tag</label>
                <div className="flex items-center space-x-3 pt-1">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewSubjectColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newSubjectColor === c ? 'scale-125 ring-2 ring-indigo-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
