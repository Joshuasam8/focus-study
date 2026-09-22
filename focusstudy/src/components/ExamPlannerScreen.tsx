import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Play,
  Trash2,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react';
import { Exam, Subject } from '../types';
import { getDaysRemaining } from '../utils/storage';

interface ExamPlannerScreenProps {
  exams: Exam[];
  subjects: Subject[];
  onAddExam: (exam: Omit<Exam, 'id'>) => void;
  onDeleteExam: (examId: string) => void;
  onStartFocusOnSubject: (subjectId: string) => void;
}

export const ExamPlannerScreen: React.FC<ExamPlannerScreenProps> = ({
  exams,
  subjects,
  onAddExam,
  onDeleteExam,
  onStartFocusOnSubject,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [examName, setExamName] = useState('');
  const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || '');
  const [examDate, setExamDate] = useState(
    new Date(Date.now() + 86400 * 1000 * 7).toISOString().split('T')[0]
  );
  const [examTime, setExamTime] = useState('09:00 AM');
  const [examLocation, setExamLocation] = useState('');
  const [examTopics, setExamTopics] = useState('');
  const [examTargetGrade, setExamTargetGrade] = useState('A');

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !examSubjectId) return;

    const topicsArray = examTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onAddExam({
      name: examName.trim(),
      subjectId: examSubjectId,
      date: examDate,
      time: examTime.trim() || undefined,
      location: examLocation.trim() || undefined,
      topics: topicsArray.length > 0 ? topicsArray : ['Comprehensive Syllabus'],
      targetGrade: examTargetGrade,
    });

    setExamName('');
    setExamLocation('');
    setExamTopics('');
    setIsAddModalOpen(false);
  };

  const sortedExams = [...exams]
    .map((e) => ({ ...e, daysLeft: getDaysRemaining(e.date) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            College Deadlines
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Exam Planner
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Exam</span>
        </button>
      </div>

      {/* Countdown Cards */}
      <div className="space-y-3.5">
        {sortedExams.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No exams scheduled
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Add your midterms, quizzes, and finals so FocusStudy can calculate smart study suggestions.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
            >
              Schedule First Exam
            </button>
          </div>
        ) : (
          sortedExams.map((exam) => {
            const subject = subjects.find((s) => s.id === exam.subjectId);
            const isUrgent = exam.daysLeft <= 5;

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {subject && (
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                      )}
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {subject?.name || 'Academic Course'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {exam.name}
                    </h3>
                  </div>

                  {/* Countdown Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-2xl text-center shrink-0 border ${
                      isUrgent
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 font-black'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60 font-bold'
                    }`}
                  >
                    <div className="text-sm">
                      {exam.daysLeft <= 0
                        ? 'Today!'
                        : `${exam.daysLeft} Day${exam.daysLeft === 1 ? '' : 's'}`}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500">
                      Remaining
                    </div>
                  </div>
                </div>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                  {exam.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{exam.time}</span>
                    </span>
                  )}
                  {exam.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{exam.location}</span>
                    </span>
                  )}
                  {exam.targetGrade && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                      Target: {exam.targetGrade}
                    </span>
                  )}
                </div>

                {/* Important Topics to Cover */}
                {exam.topics && exam.topics.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Important Topics
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {exam.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onStartFocusOnSubject(exam.subjectId)}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Prep Focus Session</span>
                  </button>

                  <button
                    onClick={() => onDeleteExam(exam.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg"
                    title="Remove exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Exam Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Exam or Quiz
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures Midterm"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={examSubjectId}
                  onChange={(e) => setExamSubjectId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Room
                  </label>
                  <input
                    type="text"
                    placeholder="Hall 104"
                    value={examLocation}
                    onChange={(e) => setExamLocation(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Grade
                  </label>
                  <input
                    type="text"
                    placeholder="A"
                    value={examTargetGrade}
                    onChange={(e) => setExamTargetGrade(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Important Topics (Comma separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="Trees, Graphs, Sorting, Dynamic Programming"
                  value={examTopics}
                  onChange={(e) => setExamTopics(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-sm mt-4"
              >
                Schedule Exam
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
