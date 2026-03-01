
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../constants';
import { Course, Task, Note } from '../types';
import { storageService } from '../services/storageService';
import { customModelService } from '../services/customModelService';

interface ProfileViewProps {
  instituteName: string;
  semester: number;
  courses: Course[];
  tasks: Task[];
  notes: Note[];
  onReset: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  instituteName,
  semester,
  courses,
  tasks,
  notes,
  onReset
}) => {
  // External Endpoint (Colab FastAPI)
  const [customUrl, setCustomUrl] = useState(customModelService.getEndpoint());
  const [useCustom, setUseCustom] = useState(customModelService.isCustomEnabled());

  // Gemini Tuning Configuration
  const [tunedModelId, setTunedModelId] = useState(() => localStorage.getItem('gemini_custom_model_id') || '');
  const [customInstruction, setCustomInstruction] = useState(() => localStorage.getItem('gemini_custom_instruction') || '');
  const [useTuning, setUseTuning] = useState(() => localStorage.getItem('use_gemini_tuning') === 'true');

  const completedTasks = tasks.filter(t => t.completed).length;
  const masterNotes = notes.filter(n => n.confidence === 'MASTERED').length;

  const handleExport = () => storageService.exportAllData();

  const handleUpdateEndpoint = (url: string) => {
    setCustomUrl(url);
    customModelService.setEndpoint(url);
  };

  const handleToggleCustom = () => {
    const newState = !useCustom;
    setUseCustom(newState);
    customModelService.setCustomEnabled(newState);
  };

  const saveTuning = (id: string, instruction: string, enabled: boolean) => {
    localStorage.setItem('gemini_custom_model_id', id);
    localStorage.setItem('gemini_custom_instruction', instruction);
    localStorage.setItem('use_gemini_tuning', String(enabled));
  };

  return (
    <div className="p-12 md:p-24 max-w-6xl mx-auto space-y-20 pb-40">
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Identity Profile</p>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter italic uppercase leading-none">Architect</h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl">Your local cognitive footprint within the Neural Architect ecosystem.</p>
        </div>
        <button 
          onClick={onReset}
          className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-500/20 transition-all"
        >
          Destructive Reset
        </button>
      </header>

      {/* GEMINI TUNING INTEGRATION */}
      <section className="notion-card p-12 bg-purple-600/5 border-purple-500/20 space-y-10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Icons.Brain className="text-white w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white italic">Gemini Neural Tuning</h3>
            <p className="text-slate-500 text-sm">Plug in your custom-trained Gemini model and system persona from Colab.</p>
          </div>
          <button 
            onClick={() => {
              const newState = !useTuning;
              setUseTuning(newState);
              saveTuning(tunedModelId, customInstruction, newState);
            }}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${useTuning ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500 border border-white/10'}`}
          >
            {useTuning ? 'Tuning Active' : 'Standard Mode'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Tuned Model Name</label>
            <input 
              value={tunedModelId}
              onChange={(e) => {
                setTunedModelId(e.target.value);
                saveTuning(e.target.value, customInstruction, useTuning);
              }}
              placeholder="tunedModels/my-custom-model-xxxx"
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-5 text-purple-400 font-mono text-sm focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Core Personality Instruction</label>
            <textarea 
              value={customInstruction}
              onChange={(e) => {
                setCustomInstruction(e.target.value);
                saveTuning(tunedModelId, e.target.value, useTuning);
              }}
              placeholder="Paste your Colab system instructions here..."
              className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-5 text-slate-300 text-sm focus:outline-none focus:border-purple-500 transition-all resize-none"
            />
          </div>
        </div>
      </section>

      {/* EXTERNAL API ENDPOINT (FASTAPI/COLAB) */}
      <section className="notion-card p-12 bg-indigo-600/5 border-indigo-500/20 space-y-10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Icons.Zap className="text-white w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white italic">External API Link (FastAPI)</h3>
            <p className="text-slate-500 text-sm">Bridge an external Python server (like ngrok) to the frontend.</p>
          </div>
          <button 
            onClick={handleToggleCustom}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${useCustom ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500 border border-white/10'}`}
          >
            {useCustom ? 'Link Active' : 'Link Offline'}
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Colab API Endpoint (ngrok URL)</label>
          <input 
            value={customUrl}
            onChange={(e) => handleUpdateEndpoint(e.target.value)}
            placeholder="https://xxxx.ngrok.io/chat"
            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-5 text-indigo-400 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 notion-card p-10 space-y-8 relative overflow-hidden group">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-[60px] group-hover:bg-indigo-500/20 transition-colors" />
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Icons.User className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white">Academic Node</h3>
            <p className="text-slate-500 font-medium">{instituteName}</p>
          </div>
          <div className="pt-8 border-t border-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-black uppercase text-[10px] tracking-widest">Phase</span>
              <span className="text-white font-black text-xl">0{semester}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 notion-card p-12 space-y-12">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Neural Efficiency</h3>
            <Icons.Activity className="text-indigo-500 w-5 h-5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="space-y-2">
              <p className="text-6xl font-black text-white italic tracking-tighter">{completedTasks}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Synapses Completed</p>
            </div>
            <div className="space-y-2">
              <p className="text-6xl font-black text-indigo-500 italic tracking-tighter">{masterNotes}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mastery Nodes Created</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
