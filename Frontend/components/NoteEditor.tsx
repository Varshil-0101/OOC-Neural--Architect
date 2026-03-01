
import React, { useState } from 'react';
import { Note, Course, Task, ConfidenceLevel } from '../types';
import { Icons } from '../constants';
import { geminiService } from '../services/geminiService';

interface NoteEditorProps {
  note: Note;
  course: Course;
  linkedTasks: Task[];
  allTasks: Task[];
  onSave: (note: Note) => void;
  onClose: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  course,
  linkedTasks,
  onSave,
  onClose
}) => {
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [confidence, setConfidence] = useState(note.confidence);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePracticeMode = async () => {
    setIsGenerating(true);
    try {
      const q = await geminiService.generatePracticeQuestions({ ...note, title, content });
      setContent(prev => prev + "\n\n--- PRACTICE SESSION ---\n" + q);
    } catch (err) {
      alert("Lattice failure. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-950">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-10 py-8 flex items-center justify-between border-b border-white/5 bg-slate-900/40">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-4 mb-2">
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors">
                <Icons.ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{course.name} Entry</span>
              </div>
            </div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-3xl font-black bg-transparent text-white border-none focus:ring-0 p-0 w-full placeholder:text-slate-800 ml-9"
              placeholder="Give your thoughts a name..."
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handlePracticeMode}
              disabled={isGenerating}
              className="hidden md:flex bg-white/5 hover:bg-white/10 text-slate-300 px-6 py-3 rounded-2xl font-bold items-center gap-2 border border-white/10 transition-all"
            >
              <Icons.Brain className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
              Generate Insight
            </button>
            <button 
              onClick={() => onSave({ ...note, title, content, confidence, updatedAt: Date.now() })}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest"
            >
              <Icons.Save className="w-4 h-4" />
              Capture
            </button>
          </div>
        </header>

        <div className="flex-1 p-10 md:p-20 overflow-y-auto">
          <div className="max-w-4xl mx-auto h-full">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-full bg-transparent border-none focus:ring-0 resize-none text-slate-300 text-xl md:text-2xl leading-relaxed font-serif placeholder:text-slate-800"
              placeholder="Transcribe your consciousness here... every subject needs its sanctuary."
            />
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-80 border-l border-white/5 bg-slate-900/50 p-8 space-y-8 overflow-y-auto">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mastery Progress</h4>
            <Icons.Activity className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="space-y-2">
            {[ConfidenceLevel.MASTERED, ConfidenceLevel.GOOD, ConfidenceLevel.FAIR, ConfidenceLevel.NEEDS_REVISION].map(c => (
              <button
                key={c}
                onClick={() => setConfidence(c)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  confidence === c ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/5 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{c.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Neural Context</h4>
            <Icons.Zap className="w-3 h-3 text-purple-400" />
          </div>
          <div className="space-y-3">
            {linkedTasks.length > 0 ? linkedTasks.map(t => (
              <div key={t.id} className="p-4 bg-slate-800 rounded-2xl border border-white/5 text-[10px] text-slate-300 font-black uppercase tracking-widest">
                {t.title}
              </div>
            )) : (
              <p className="text-[10px] text-slate-600 italic">No linked synapses yet.</p>
            )}
          </div>
        </section>
        
        <div className="pt-8 mt-auto border-t border-white/5 text-center">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Architect Security Protocol v2.4</p>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
