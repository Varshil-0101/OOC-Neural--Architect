
import React, { useState, useEffect, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Task, TaskPriority, Insight, Note, StudyMaterial, ProgressSnapshot } from '../types';
import { Icons } from '../constants';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface DashboardProps {
  priorityTasks: Task[];
  allTasks: Task[];
  onCompleteTask: (id: string) => void;
  instituteName: string;
  selectedSemester: number;
  notes: Note[];
  materials: StudyMaterial[];
  onRequireAuth: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  priorityTasks,
  allTasks,
  onCompleteTask,
  instituteName,
  notes,
  materials,
  onRequireAuth
}) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const learningHistory = useMemo(() => storageService.getLearningHistory(), []);
  
  // Progress Calculations
  const taskProgress = allTasks.length > 0 ? (allTasks.filter(t => t.completed).length / allTasks.length) : 0;
  const lectureProgress = materials.filter(m => m.type === 'LECTURE').length > 0 
    ? (materials.filter(m => m.type === 'LECTURE' && m.completed).length / materials.filter(m => m.type === 'LECTURE').length) : 0;
  const problemProgress = materials.filter(m => m.type === 'PROBLEM_SET').length > 0 
    ? (materials.filter(m => m.type === 'PROBLEM_SET' && m.completed).length / materials.filter(m => m.type === 'PROBLEM_SET').length) : 0;
  
  // Innovative "Neural Saturation" Index
  const saturation = Math.round(((taskProgress * 0.3) + (lectureProgress * 0.4) + (problemProgress * 0.3)) * 100);

  useEffect(() => {
    const loadInsights = async () => {
      if (notes.length === 0) return;
      setIsLoadingInsights(true);
      try {
        const data = await geminiService.getBrainInsights(notes, allTasks);
        setInsights(data);
        
        // Record current progress to history for the graph
        storageService.recordSnapshot({
          date: new Date().toISOString().split('T')[0],
          score: saturation
        });
      } catch (err) {
        console.error("Insight generation failure", err);
      } finally {
        setIsLoadingInsights(false);
      }
    };
    loadInsights();
  }, [notes, allTasks, saturation]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="p-12 md:p-20 max-w-7xl mx-auto space-y-20 pb-40">
      <motion.header 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest rounded-full">
              System Live
            </span>
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest">{instituteName}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] uppercase">
            Focus<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-700">Console</span>
          </h1>
        </div>

        <div className="notion-card px-10 py-10 flex flex-col gap-8 min-w-[380px] bg-slate-900/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl group-hover:bg-indigo-600/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Neural Saturation</p>
              <p className="text-6xl font-black text-white tracking-tighter italic">{saturation}%</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/40">
              <Icons.Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-5 relative z-10">
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                <span>Synapse Completion</span>
                <span className="text-white font-bold">{Math.round(taskProgress * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${taskProgress * 100}%` }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              </div>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                <span>Lattice Mastery (Lectures/Sets)</span>
                <span className="text-white font-bold">{Math.round(((lectureProgress + problemProgress) / 2) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${((lectureProgress + problemProgress) / 2) * 100}%` }} className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* PERFORMANCE GRAPH SECTION */}
      <section className="space-y-12">
        <div className="flex items-center gap-6">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Learning Velocity</h2>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        
        <div className="notion-card p-12 h-64 flex items-end justify-between gap-4 relative">
          {learningHistory.length > 0 ? (
            learningHistory.slice(-14).map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="relative w-full flex flex-col items-center">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${day.score}%` }}
                    transition={{ delay: i * 0.05, duration: 1 }}
                    className={`w-full max-w-[40px] rounded-t-xl transition-all ${day.score > 70 ? 'bg-indigo-500' : 'bg-slate-700'}`}
                  />
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 px-3 py-1 rounded-lg text-xs font-black text-white">
                    {day.score}%
                  </div>
                </div>
                <span className="text-xs font-black text-slate-600 uppercase transform -rotate-45 whitespace-nowrap">{day.date.split('-').slice(1).join('/')}</span>
              </div>
            ))
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <p className="text-xs font-black uppercase tracking-widest">Awaiting Neural Data History...</p>
            </div>
          )}
        </div>
      </section>

      {/* INTELLIGENCE HUB SECTION */}
      <section className="space-y-12">
        <div className="flex items-center gap-6">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Actionable Insights</h2>
          <div className="h-px flex-1 bg-white/5" />
          {isLoadingInsights && <Icons.Clock className="w-4 h-4 text-indigo-500 animate-spin" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {insights.map((insight) => (
            <motion.div 
              key={insight.id}
              whileHover={{ y: -5 }}
              className="p-8 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  {insight.type === 'FORGOTTEN' ? <Icons.Clock className="w-4 h-4 text-indigo-400" /> : <Icons.Zap className="w-4 h-4 text-purple-400" />}
                </div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{insight.type}</span>
              </div>
              <h4 className="text-lg font-black text-white tracking-tight">{insight.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{insight.description}</p>
              <button 
                onClick={onRequireAuth}
                className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] pt-2 hover:text-indigo-300 transition-colors"
              >
                {insight.actionLabel} →
              </button>
            </motion.div>
          ))}
          {insights.length === 0 && !isLoadingInsights && (
            <div className="col-span-3 text-center py-10 opacity-20">
              <p className="text-xs font-black uppercase tracking-widest">Initial Context Mapping Underway...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
