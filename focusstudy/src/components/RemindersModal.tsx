import React, { useState } from 'react';
import { Bell, Plus, Trash2, X, CheckCircle, Clock } from 'lucide-react';
import { ReminderItem } from '../types';

interface RemindersModalProps {
  isOpen: boolean;
  reminders: ReminderItem[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<ReminderItem, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
  onClose: () => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<'study' | 'exam' | 'break' | 'task'>('study');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  if (!isOpen) return null;

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddReminder({
      title: title.trim(),
      time,
      type,
      days: selectedDays.length > 0 ? selectedDays : ['Daily'],
      enabled: true,
    });

    setTitle('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Study & Exam Reminders
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Reminders List */}
        <div className="mt-4 space-y-3">
          {reminders.map((rem) => {
            const typeBadge =
              rem.type === 'exam'
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                : rem.type === 'break'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400';

            return (
              <div
                key={rem.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleReminder(rem.id)}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                      rem.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        rem.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {rem.title}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${typeBadge}`}>
                        {rem.type}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{rem.time}</span>
                      <span>•</span>
                      <span className="truncate">{rem.days.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                  title="Remove reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add New Form */}
        {isAdding ? (
          <form onSubmit={handleAdd} className="mt-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">Create New Reminder</h4>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reminder Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Afternoon Focus Sprint"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="study">Study Session</option>
                  <option value="exam">Exam Reminder</option>
                  <option value="task">Task Deadline</option>
                  <option value="break">Posture/Break</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Repeat Days
              </label>
              <div className="flex flex-wrap gap-1">
                {DAYS.map((day) => {
                  const isSel = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                        isSel
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
              >
                Save Reminder
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="py-2 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full mt-4 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Reminder</span>
          </button>
        )}
      </div>
    </div>
  );
};
