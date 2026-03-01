
import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../constants';

interface IntroPageProps {
  onStart: () => void;
}

const DRIFT_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600',
];

const IntroPage: React.FC<IntroPageProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-slate-950">
      
      {/* RADIANT AMBIENT GLOW */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1.2 }}
        transition={{ duration: 4, ease: "easeOut" }}
        className="absolute inset-0 z-0 bg-radial-gradient from-indigo-600/30 via-slate-950 to-slate-950 blur-[140px]" 
      />

      {/* STAGE 1: Neural Background Fragments (Arrive Instantly) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {DRIFT_IMAGES.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6, rotate: -5, x: (Math.random() * 200 - 100), y: (Math.random() * 200 - 100) }}
            animate={{ 
              opacity: [0, 0.4, 0.25], 
              scale: [0.6, 1, 0.95],
              rotate: 0,
              x: (Math.random() * 50 - 25),
              y: (Math.random() * 50 - 25)
            }}
            transition={{ 
              duration: 2.5 + (i * 0.4), 
              ease: "circOut",
              opacity: { duration: 1.5, delay: i * 0.1 } 
            }}
            className="absolute w-52 h-72 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl grayscale contrast-125"
            style={{ 
              top: `${10 + (i * 15)}%`, 
              left: `${5 + (i * 18)}%`,
            }}
          >
            <img src={src} alt="" className="w-full h-full object-cover opacity-40 hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-indigo-900/40 mix-blend-soft-light" />
          </motion.div>
        ))}
      </div>

      {/* STAGE 2: VIBRANT CONTENT (Delayed Entrance) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
        className="relative z-10 space-y-12 max-w-7xl w-full"
      >
        <div className="relative inline-block">
          <motion.div 
            initial={{ scale: 0, rotate: -90, filter: 'blur(20px)' }}
            animate={{ scale: 1, rotate: 0, filter: 'blur(0px)' }}
            transition={{ delay: 2, type: "spring", stiffness: 80 }}
            className="relative w-40 h-40 bg-indigo-600 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(79,70,229,0.5)] border-2 border-white/20"
          >
            <Icons.Brain className="w-20 h-20 text-white" />
            <motion.div 
              animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.3, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-indigo-400 blur-3xl rounded-full"
            />
          </motion.div>
        </div>

        <div className="space-y-8 overflow-hidden">
          <motion.h1 
            initial={{ opacity: 0, y: 120, rotateX: 60 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 2.3, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase italic leading-none whitespace-nowrap"
          >
            Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 animate-gradient">Architect</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.8, duration: 1.2 }}
            className="text-slate-400 text-xl md:text-3xl font-medium tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Transcending traditional study limits through <span className="text-white font-black italic">Cognitive Synthesis</span>.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.4, duration: 1 }}
          className="pt-12"
        >
          <button 
            onClick={onStart}
            className="group relative inline-flex items-center gap-6 bg-white text-slate-950 px-16 py-8 rounded-[2.5rem] font-black text-2xl md:text-3xl shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:shadow-[0_0_100px_rgba(79,70,229,0.6)] transition-all hover:bg-indigo-600 hover:text-white hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10 tracking-tight uppercase italic">Initialize Brain</span>
            <Icons.ChevronRight className="relative z-10 w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-3 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </motion.div>
      </motion.div>

      {/* SCANLINE FILTER */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
};

export default IntroPage;
