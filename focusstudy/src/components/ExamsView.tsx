import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Clock, BookOpen, AlertCircle, Sparkles, X, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ExamsViewProps {
  onFocusSubject: (subject: string, topic: string) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({ onFocusSubject }) => {
  const { exams, subjects, addExam, deleteExam } = useApp();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [examSubject, setExamSubject] = useState<string>(
    subjects.length > 0 ? subjects[0].name : 'Data Structures & Algorithms'
  );
  const [examTitle, setExamTitle] = useState<string>('');
  const [examDate, setExamDate] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [examTime, setExamTime] = useState<string>('09:00');

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDate) return;

    await addExam({
      subject: examSubject,
      title: examTitle.trim(),
      date: examDate,
      time: examTime,
    });
    setIsModalOpen(false);
    setExamTitle('');
  };

  const getDaysCountdown = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Exam Countdown & Prep
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track midterm, final, and quiz deadlines to schedule targeted study sprints
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-indigo-200 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam Deadline</span>
        </button>
      </div>

      {/* Exam Cards Grid */}
      {exams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Upcoming Exams Logged</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your upcoming course finals or midterms to see precise day countdowns and targeted revision.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            + Add First Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {exams.map((exam) => {
            const daysLeft = getDaysCountdown(exam.date);
            const isUrgent = daysLeft >= 0 && daysLeft <= 3;
            const isPast = daysLeft < 0;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                      {exam.subject}
                    </span>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    {exam.title}
                  </h3>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.date}</span>
                    {exam.time && (
                      <>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.time}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Countdown highlight card */}
                <div
                  className={`p-4 rounded-2xl flex items-center justify-between ${
                    isPast
                      ? 'bg-slate-100 text-slate-500'
                      : isUrgent
                      ? 'bg-rose-50 text-rose-900 border border-rose-200'
                      : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                      Countdown
                    </p>
                    <p className="text-2xl font-black">
                      {isPast
                        ? 'Completed'
                        : daysLeft === 0
                        ? 'TODAY'
                        : daysLeft === 1
                        ? '1 Day Left'
                        : `${daysLeft} Days Left`}
                    </p>
                  </div>

                  {!isPast && (
                    <button
                      onClick={() => onFocusSubject(exam.subject, `${exam.title} Prep`)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-1"
                    >
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sprint Focus 🎯</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Exam Schedule</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="uppercase tracking-wider">Subject</label>
                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
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

              <div className="space-y-1">
                <label className="uppercase tracking-wider">Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm 1: Trees & Sorting"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Time (Optional)</label>
                  <input
                    type="time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
