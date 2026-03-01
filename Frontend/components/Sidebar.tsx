
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  courses: Course[];
  activeView: string;
  activeCourseId: string | null;
  onNavigate: (view: string, courseId?: string | null) => void;
  onAddCourse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  courses,
  activeView,
  activeCourseId,
  onNavigate,
  onAddCourse
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [activeView, activeCourseId]);

  const NavItem = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        activeView === id && !activeCourseId
          ? 'bg-white/10 text-white shadow-sm border border-white/10'
          : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeView === id ? 'text-indigo-400' : ''}`} />
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
  );

  return (
    <aside className="w-64 bg-slate-950/50 border-r border-white/5 flex flex-col p-6 relative">
      <div className="mb-12 px-2">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-white p-2 rounded-lg shrink-0">
              <Icons.Brain className="w-5 h-5 text-slate-950" />
            </div>
          </div>
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic">
            Neural<br/><span className="text-slate-500 not-italic tracking-widest text-[10px]">Architect</span>
          </h1>
        </div>
        
        <div className="mt-6 flex items-center gap-2 px-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
            {isSyncing ? 'Syncing Lattice...' : 'Node Encrypted'}
          </span>
        </div>
      </div>

      <nav className="space-y-1.5 mb-12">
        <p className="px-4 mb-3 text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Workspace</p>
        <NavItem id="dashboard" label="Focus Console" icon={Icons.Dashboard} />
        <NavItem id="todo" label="Active Synapses" icon={Icons.Tasks} />
        <NavItem id="calendar" label="Timeline" icon={Icons.Calendar} />
      </nav>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-4 px-4">
          <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Domains</p>
        </div>
        
        <div className="space-y-1">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => onNavigate('course', course.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 group transition-all duration-300 ${
                activeCourseId === course.id
                  ? 'bg-indigo-500/10 text-white border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full transition-transform group-hover:scale-125" 
                style={{ backgroundColor: course.color }}
              />
              <span className="font-bold text-sm truncate tracking-tight">{course.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button 
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-slate-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <Icons.Settings className="w-5 h-5" />
          <span className="font-bold text-sm">Configuration</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
