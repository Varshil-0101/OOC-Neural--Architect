
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyMaterial, Course } from '../types';
import { Icons } from '../constants';

interface StudyMaterialViewProps {
  materials: StudyMaterial[];
  courses: Course[];
  onToggleMaterial: (id: string) => void;
  onAddMaterial: (mat: StudyMaterial) => void;
  isCompact?: boolean;
  onRequireAuth: () => void;
}

const StudyMaterialView: React.FC<StudyMaterialViewProps> = ({ 
  materials, 
  courses, 
  onToggleMaterial, 
  onAddMaterial,
  isCompact = false,
  onRequireAuth
}) => {
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'LECTURE' | 'PROBLEM_SET'>('LECTURE');
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);

  const selectedCourse = courses.find(c => c.id === activeCourseId);
  const filteredMaterials = materials.filter(m => 
    m.courseId === activeCourseId && m.type === activeTab
  ).sort((a, b) => a.order - b.order);

  // Automatic Initialization Logic
  useEffect(() => {
    const courseMaterials = materials.filter(m => m.courseId === activeCourseId);
    
    if (courseMaterials.length === 0 && activeCourseId) {
      let defaultMats: StudyMaterial[] = [];
      
      const courseName = courses.find(c => c.id === activeCourseId)?.name.toLowerCase() || '';
      
      if (courseName.includes('linear algebra')) {
        defaultMats = [
          { 
            id: crypto.randomUUID(), 
            courseId: activeCourseId, 
            title: 'Lecture 1: Groups & Fields', 
            type: 'LECTURE', 
            content: 'Definition of Binary Operations, Groups (Associativity, Identity, Inverse), Abelian groups, and Permutation/Symmetric groups (Sn).', 
            completed: false, 
            order: 1,
            url: 'https://profile.iiita.ac.in/seemak/Lecture_1.pdf'
          },
          { 
            id: crypto.randomUUID(), 
            courseId: activeCourseId, 
            title: 'Lecture 2: System of Linear Equations', 
            type: 'LECTURE', 
            content: 'Analysis of homogeneous and non-homogeneous systems. Matrix representation Ax = b, Coefficient/Augmented matrices.', 
            completed: false, 
            order: 2,
            url: 'https://profile.iiita.ac.in/seemak/Lecture_2.pdf'
          },
          { 
            id: crypto.randomUUID(), 
            courseId: activeCourseId, 
            title: 'Problem Set I: Group Theory & Permutations', 
            type: 'PROBLEM_SET', 
            content: 'Exercises on (Mm×n(R), +) groups, matrix commutativity proofs, permutation signs, and row operations.', 
            completed: false, 
            order: 1,
            url: 'https://profile.iiita.ac.in/seemak/problem_set_1.pdf'
          },
          { 
            id: crypto.randomUUID(), 
            courseId: activeCourseId, 
            title: 'Problem Set 2: Vector Spaces & Determinants', 
            type: 'PROBLEM_SET', 
            content: 'Detailed evaluation of n×n determinants, adjoint matrix properties, and Vector Space verification over R.', 
            completed: false, 
            order: 2,
            url: 'https://profile.iiita.ac.in/seemak/problem_set_2.pdf'
          },
        ];
      } else {
        defaultMats = [
          { id: crypto.randomUUID(), courseId: activeCourseId, title: 'Lecture 01: Fundamentals', type: 'LECTURE', content: 'Core principles and introduction to the domain.', completed: false, order: 1 },
          { id: crypto.randomUUID(), courseId: activeCourseId, title: 'Lecture 02: Structural Analysis', type: 'LECTURE', content: 'In-depth look at architecture and logic.', completed: false, order: 2 },
          { id: crypto.randomUUID(), courseId: activeCourseId, title: 'Problem Set A: Logic Gates', type: 'PROBLEM_SET', content: 'Exercise set for fundamental logic.', completed: false, order: 1 },
        ];
      }
      
      defaultMats.forEach(onAddMaterial);
    }
  }, [activeCourseId, materials.length]);

  const handleMaterialClick = (mat: StudyMaterial) => {
    if (mat.url) {
      window.open(mat.url, '_blank');
    } else {
      setSelectedMaterial(mat);
    }
  };

  const getFullContent = (mat: StudyMaterial) => {
    if (mat.title.includes('Lecture 1: Groups')) {
      return `LECTURE 1 (GROUPS & FIELDS)\n\nDEFINITIONS:\n1. Binary Operation: A function *: G x G -> G.\n2. Group (G, *): Satisfies Associativity, Identity (e), and Inverse (a^-1).\n3. Abelian Group: A group where a * b = b * a.\n\nPERMUTATION GROUPS (Sn):\n- Sn has n! elements.\n- Elements are bijections of {1, 2, ..., n}.\n- Cyclic Notation: e.g., (1 3 5 4).\n- Transpositions: A cycle of length 2.\n- Even/Odd Permutations: Based on the product of transpositions.\n- Signature Function: sgn(σ) = 1 for even, -1 for odd.`;
    }
    return mat.content;
  };

  return (
    <div className={`${isCompact ? 'space-y-8' : 'p-10 md:p-20 max-w-7xl mx-auto space-y-16 pb-40'}`}>
      {!isCompact && (
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div className="space-y-4">
            <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.5em]">Knowledge Repository</p>
            <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Neural<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Materials</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={activeCourseId}
              onChange={(e) => setActiveCourseId(e.target.value)}
              className="bg-slate-900/60 border border-white/10 text-white text-xs font-black uppercase tracking-widest px-6 py-4 rounded-2xl outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              {courses.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
            </select>
          </div>
        </header>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-4 p-1.5 bg-slate-900/60 backdrop-blur-xl rounded-[2rem] w-fit border border-white/5">
          {(['LECTURE', 'PROBLEM_SET'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab === 'LECTURE' ? 'Lectures' : 'Problem Sets'}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isCompact ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8`}>
        <AnimatePresence mode="popLayout">
          {filteredMaterials.map((mat) => (
            <motion.div
              layout
              key={mat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => handleMaterialClick(mat)}
              className={`notion-card p-10 space-y-6 relative overflow-hidden group cursor-pointer ${mat.completed ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${mat.type === 'LECTURE' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                  {mat.type === 'LECTURE' ? <Icons.Courses className="w-6 h-6" /> : <Icons.Zap className="w-6 h-6" />}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleMaterial(mat.id); }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${mat.completed ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-600 group-hover:border-indigo-500'}`}
                >
                  <Icons.Check className={`w-5 h-5 ${mat.completed ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight">{mat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{mat.content}</p>
              </div>

              <div className="pt-6 border-t border-white/5 mt-auto flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-600">
                <div className="flex items-center gap-2">
                  <Icons.Audio className={`w-3 h-3 ${mat.url ? 'text-emerald-400' : 'text-indigo-400'}`} />
                  <span>{mat.url ? 'Open PDF (Edge/Drive)' : 'Open Internal Node'}</span>
                </div>
                <span className={mat.completed ? 'text-emerald-500' : ''}>{mat.completed ? 'Synchronized' : 'Pending'}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredMaterials.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-[3rem] border border-dashed border-white/5 bg-white/5">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-black uppercase tracking-widest text-[10px] italic">Synchronizing Domain Context...</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMaterial && !selectedMaterial.url && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMaterial(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="max-w-5xl w-full h-full bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
              <header className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedMaterial.type === 'LECTURE' ? 'bg-indigo-600' : 'bg-amber-600'}`}>
                    <Icons.Notes className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">{selectedMaterial.title}</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedCourse?.name} • Phase {selectedCourse?.semester}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMaterial(null)}
                  className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center transition-all"
                >
                  <Icons.Plus className="w-6 h-6 rotate-45" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Executive Summary</p>
                    <p className="text-slate-300 text-lg leading-relaxed italic">{selectedMaterial.content}</p>
                  </div>

                  <div className="space-y-6">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5 pb-4">Extracted Node Content</p>
                    <div className="text-slate-200 text-lg leading-relaxed font-serif whitespace-pre-wrap">
                      {getFullContent(selectedMaterial)}
                    </div>
                  </div>
                  <div className="h-40" />
                </div>
              </div>

              <footer className="p-8 border-t border-white/5 bg-slate-950/50 flex justify-center gap-4">
                <button 
                  onClick={() => onToggleMaterial(selectedMaterial.id)}
                  className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedMaterial.completed ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'}`}
                >
                  {selectedMaterial.completed ? 'Material Synchronized' : 'Mark as Synchronized'}
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMaterialView;
