
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Exam, TaskType, Course, TaskPriority } from '../types';
import { Icons } from '../constants';
import { MapPin, AlignLeft, CheckCircle2 } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  exams: Exam[];
  courses: Course[];
  onAddTask: (data: Partial<Task>) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, exams, courses, onAddTask }) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('10:30');
  const [activeEntryType, setActiveEntryType] = useState<'Event' | 'Task' | 'Appointment'>('Event');
  const [selectedDateForEntry, setSelectedDateForEntry] = useState<Date | null>(null);

  const days = Array.from({ length: 35 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (new Date().getDay()) + i);
    return date;
  });

  const getWorkloadLevel = (count: number) => {
    if (count === 0) return 'bg-white/5';
    if (count < 3) return 'bg-indigo-500/10 border-indigo-500/20';
    if (count < 6) return 'bg-indigo-500/30 border-indigo-500/40';
    return 'bg-red-500/20 border-red-500/40';
  };

  const handleCreateEntry = () => {
    if (!quickTitle.trim() || !selectedDateForEntry) return;

    const typeMap: Record<string, TaskType> = {
      'Event': TaskType.CLASS,
      'Task': TaskType.HOMEWORK,
      'Appointment': TaskType.STUDY_SESSION
    };

    onAddTask({
      id: crypto.randomUUID(),
      title: quickTitle,
      courseId: courses[0]?.id || 'general',
      dueDate: selectedDateForEntry.toISOString().split('T')[0],
      priority: activeEntryType === 'Appointment' ? TaskPriority.CRITICAL : TaskPriority.MEDIUM,
      type: typeMap[activeEntryType],
      completed: false,
      linkedNoteIds: [],
      estimatedHours: 1,
      description,
      location: activeEntryType === 'Event' ? location : undefined,
      startTime: activeEntryType !== 'Task' ? startTime : undefined,
      endTime: activeEntryType !== 'Task' ? endTime : undefined
    });
    
    // Reset state
    setQuickTitle('');
    setDescription('');
    setLocation('');
    setStartTime('09:30');
    setEndTime('10:30');
    setSelectedDateForEntry(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateEntry();
    if (e.key === 'Escape') setSelectedDateForEntry(null);
  };

  return (
    <div className="p-10 max-w-7xl mx-auto h-full overflow-y-auto no-scrollbar pb-32 relative">
      <header className="mb-12">
        <div className="flex flex-col">
          <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Timeline</h1>
          <p className="text-slate-500 font-medium mt-4">Contextual creation enabled. Click a node to initialize data.</p>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="p-4 bg-slate-950 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
            {d}
          </div>
        ))}
        {days.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayTasks = tasks.filter(t => t.dueDate === dateStr);
          const dayExams = exams.filter(e => e.date === dateStr);
          const eventCount = dayTasks.length + dayExams.length;
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <motion.div 
              key={idx} 
              onClick={() => setSelectedDateForEntry(day)}
              className={`min-h-[160px] p-6 flex flex-col gap-3 transition-all relative cursor-pointer bg-slate-950 hover:bg-white/[0.04] group ${getWorkloadLevel(eventCount)}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xl font-black ${isToday ? 'text-indigo-400 underline decoration-indigo-500 decoration-2 underline-offset-4' : 'text-slate-500'}`}>{day.getDate()}</span>
                <Icons.Plus className="w-4 h-4 text-white/0 group-hover:text-white/40 transition-colors" />
              </div>
              
              <div className="space-y-1.5 flex-1 overflow-hidden">
                {dayExams.map(e => (
                  <div key={e.id} className="bg-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg truncate">
                    EXAM: {e.title}
                  </div>
                ))}
                {dayTasks.map(t => (
                  <div key={t.id} className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg truncate ${
                    t.type === TaskType.CLASS ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400'
                  }`}>
                    {t.type === TaskType.CLASS ? 'EVENT: ' : ''}{t.title}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FLOATING CREATION MODAL */}
      <AnimatePresence>
        {selectedDateForEntry && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDateForEntry(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] p-10 relative z-10 space-y-8"
            >
              {/* Type Selection Header */}
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                {(['Event', 'Task', 'Appointment'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveEntryType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      activeEntryType === type 
                        ? 'bg-blue-100/10 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {type === 'Appointment' ? 'Appointment schedule' : type}
                    {type === 'Appointment' && (
                      <span className="bg-blue-600 text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                        New
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {/* Title Input */}
                <div className="relative group">
                  <input 
                    autoFocus
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add title"
                    className="w-full bg-transparent text-4xl font-medium text-slate-100 placeholder:text-slate-700 outline-none border-b-[3px] border-slate-800 focus:border-blue-500 transition-all pb-4"
                  />
                </div>

                {/* Common Time Section for Appointment and Event */}
                {(activeEntryType === 'Appointment' || activeEntryType === 'Event') && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-slate-400">
                      <Icons.Clock className="w-5 h-5 text-slate-500" />
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm font-medium">
                          {selectedDateForEntry.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="time" 
                            value={startTime} 
                            onChange={(e) => setStartTime(e.target.value)}
                            className="bg-slate-800 rounded-lg px-2 py-1.5 text-sm outline-none border-none focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-slate-600">—</span>
                          <input 
                            type="time" 
                            value={endTime} 
                            onChange={(e) => setEndTime(e.target.value)}
                            className="bg-slate-800 rounded-lg px-2 py-1.5 text-sm outline-none border-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="ml-9 text-xs text-slate-600 font-medium">Time zone • Does not repeat</p>
                  </div>
                )}

                {/* Event Specific Location */}
                {activeEntryType === 'Event' && (
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-slate-500" />
                    <input 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add location"
                      className="flex-1 bg-slate-800/50 rounded-lg px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:bg-slate-800 transition-all"
                    />
                  </div>
                )}

                {/* Task Specific Deadline & Description */}
                {activeEntryType === 'Task' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="w-5 h-5 text-slate-500" />
                      <div className="flex-1 bg-slate-800/50 rounded-lg px-4 py-3 text-sm text-slate-400">
                        {selectedDateForEntry.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <AlignLeft className="w-5 h-5 text-slate-500 mt-3" />
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add description"
                        rows={3}
                        className="flex-1 bg-slate-800/50 rounded-lg px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:bg-slate-800 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Description for Event/Appointment too */}
                {(activeEntryType === 'Event' || activeEntryType === 'Appointment') && (
                  <div className="flex items-start gap-4">
                    <AlignLeft className="w-5 h-5 text-slate-500 mt-3" />
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add description"
                      rows={2}
                      className="flex-1 bg-slate-800/50 rounded-lg px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:bg-slate-800 transition-all resize-none"
                    />
                  </div>
                )}
              </div>

              <footer className="pt-6 border-t border-white/5 flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedDateForEntry(null)}
                  className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={handleCreateEntry}
                  disabled={!quickTitle.trim()}
                  className="px-10 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-600/20"
                >
                  Save
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;
