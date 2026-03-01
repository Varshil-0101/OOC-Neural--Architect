
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Course, TaskPriority, TaskType } from '../types';
import { Icons } from '../constants';

interface TodoViewProps {
  tasks: Task[];
  courses: Course[];
  onCompleteTask: (id: string) => void;
  onAddTask: (data: Partial<Task>) => void;
  isAdding: boolean;
  setIsAdding: (val: boolean) => void;
  isLoggedIn: boolean;
  onRequireAuth: () => void;
}

const TodoView: React.FC<TodoViewProps> = ({ tasks, courses, onCompleteTask, onAddTask, isAdding, setIsAdding, isLoggedIn, onRequireAuth }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState(courses[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'pending') return !t.completed;
    return true;
  });

  const handleAdd = () => {
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    if (!newTitle || !newCourse || !newDueDate) return;
    onAddTask({
      id: crypto.randomUUID(),
      title: newTitle,
      courseId: newCourse,
      dueDate: newDueDate,
      priority: TaskPriority.MEDIUM,
      type: TaskType.HOMEWORK,
      completed: false,
      linkedNoteIds: [],
      estimatedHours: 1
    } as any);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="p-10 max-w-5xl mx-auto pb-40">
      <header className="flex flex-col mb-12">
        <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Roadmap</h1>
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-500 font-medium">Monitoring {tasks.length} active synapses across your curriculum.</p>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Icons.Plus className="w-4 h-4" />
              New Objective
            </button>
          )}
        </div>
      </header>

      <div className="flex gap-2 mb-8 bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-white/5">
        {(['pending', 'completed', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-900 border-2 border-indigo-500/30 rounded-[2.5rem] p-10 mb-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[60px]" />
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl font-black text-white tracking-tight">Initialize New Task Node</h3>
              {!isLoggedIn && (
                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                  <Icons.Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Auth Required</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Task Identification</label>
                <input 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  placeholder="Review Quantum Mechanics..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Knowledge Domain</label>
                <select 
                  value={newCourse}
                  onChange={e => setNewCourse(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm appearance-none"
                >
                  {courses.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Chronological Expiry</label>
                <input 
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm invert-[0.8] brightness-200"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleAdd}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
              >
                {isLoggedIn ? 'Synthesize Node' : 'Login to Synchronize'}
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="px-10 py-5 bg-white/5 text-slate-400 rounded-2xl font-black text-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                Abort
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {filteredTasks.map(task => {
          const course = courses.find(c => c.id === task.courseId);
          return (
            <motion.div 
              layout
              key={task.id}
              className={`group bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-6 flex items-center gap-6 transition-all hover:bg-slate-900/60 hover:border-white/10 ${task.completed ? 'opacity-40 grayscale' : ''}`}
            >
              <button 
                onClick={() => onCompleteTask(task.id)}
                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
                  task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-white/10 group-hover:border-indigo-500 bg-white/5'
                }`}
              >
                {task.completed && <Icons.Check className="w-6 h-6 text-white" />}
                {!task.completed && <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-indigo-500 transition-colors" />}
              </button>
              <div className="flex-1 min-w-0">
                <h4 className={`font-black text-xl mb-1 truncate tracking-tight ${task.completed ? 'line-through text-slate-500' : 'text-white group-hover:text-indigo-400 transition-colors'}`}>{task.title}</h4>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: course?.color || '#555' }} />
                    <span className="truncate max-w-[120px]">{course?.name}</span>
                  </span>
                  <span className="opacity-30">•</span>
                  <span className="flex items-center gap-1.5">
                    <Icons.Clock className="w-3 h-3 text-indigo-500" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                 <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                    task.priority === TaskPriority.CRITICAL ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    task.priority === TaskPriority.HIGH ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {task.priority}
                  </span>
              </div>
            </motion.div>
          );
        })}
        {filteredTasks.length === 0 && (
          <div className="py-32 text-center rounded-[3rem] border border-dashed border-white/5 bg-white/5">
            <Icons.Tasks className="w-12 h-12 mx-auto mb-4 text-slate-800" />
            <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No tasks in current frequency</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoView;
