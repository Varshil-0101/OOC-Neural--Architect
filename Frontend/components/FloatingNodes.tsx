
import React from 'react';
import { motion } from 'framer-motion';

const NODE_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=400',
];

const FloatingNodes: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden opacity-20">
      {NODE_IMAGES.map((src, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: (i * 20) + '%', 
            y: (Math.random() * 100) + '%',
            opacity: 0 
          }}
          animate={{ 
            x: [
              ((i * 20) - 5) + '%', 
              ((i * 20) + 5) + '%', 
              ((i * 20) - 5) + '%'
            ],
            y: [
              ((Math.random() * 80) + 10) + '%', 
              ((Math.random() * 80) + 10) + '%',
              ((Math.random() * 80) + 10) + '%'
            ],
            opacity: [0.1, 0.4, 0.1],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0]
          }}
          transition={{ 
            duration: 20 + (i * 5), 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute w-48 h-64 rounded-3xl overflow-hidden border border-white/5 shadow-2xl grayscale blur-[1px]"
          style={{ 
            top: `${10 + (i * 15)}%`, 
            left: `${(i * 18)}%` 
          }}
        >
          <img src={src} alt="" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingNodes;
