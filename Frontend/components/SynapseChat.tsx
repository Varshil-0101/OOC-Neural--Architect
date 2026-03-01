
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../constants';
import { geminiService, decodeBase64, decodeAudioData, encodeAudio } from '../services/geminiService';
import { customModelService } from '../services/customModelService';
import { Note } from '../types';

interface SynapseChatProps {
  onRequireAuth: () => void;
  isGuest: boolean;
  allNotes?: Note[]; 
}

const SynapseChat: React.FC<SynapseChatProps> = ({ onRequireAuth, isGuest, allNotes = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; isCustom?: boolean; isTuned?: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const isEndpointActive = customModelService.isCustomEnabled();
  const isTuningActive = localStorage.getItem('use_gemini_tuning') === 'true';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.then((session: any) => session.close());
      liveSessionRef.current = null;
    }
    setIsLiveActive(false);
    audioSourcesRef.current.forEach(s => s.stop());
    audioSourcesRef.current.clear();
  };

  const startLiveSession = async () => {
    if (isGuest) {
      onRequireAuth();
      return;
    }

    setIsLiveActive(true);
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    audioContextRef.current = outputCtx;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const systemInstruction = `You are the Neural Architect. Help the user study using their notes: ${allNotes.map(n => n.title).join(', ')}. Use a calm, professional, and intellectually stimulating voice.`;

    const sessionPromise = geminiService.connectLive({
      onopen: () => {
        const source = inputCtx.createMediaStreamSource(stream);
        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const l = inputData.length;
          const int16 = new Int16Array(l);
          for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
          
          const pcmBlob = {
            data: encodeAudio(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
          };

          sessionPromise.then((session: any) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputCtx.destination);
      },
      onmessage: async (message) => {
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
          const buffer = await decodeAudioData(decodeBase64(base64Audio), outputCtx, 24000, 1);
          const source = outputCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(outputCtx.destination);
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += buffer.duration;
          audioSourcesRef.current.add(source);
          source.onended = () => audioSourcesRef.current.delete(source);
        }
        if (message.serverContent?.interrupted) {
          audioSourcesRef.current.forEach(s => s.stop());
          audioSourcesRef.current.clear();
          nextStartTimeRef.current = 0;
        }
      },
      onclose: () => setIsLiveActive(false),
      onerror: () => setIsLiveActive(false)
    }, systemInstruction);

    liveSessionRef.current = sessionPromise;
  };

  const handleSend = async () => {
    if (isGuest) {
      onRequireAuth();
      return;
    }
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      if (isEndpointActive) {
        const response = await customModelService.chat(userMsg);
        setMessages(prev => [...prev, { role: 'ai', text: response, isCustom: true }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: '', isTuned: isTuningActive }]);
        let fullResponse = '';
        const stream = geminiService.chatStream(null, allNotes, userMsg);
        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { role: 'ai', text: fullResponse, isTuned: isTuningActive };
            return newMsgs;
          });
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Lattice sync error. Check API configuration." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-24 right-0 w-[400px] h-[600px] bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`p-8 border-b border-white/5 flex items-center justify-between transition-colors duration-500 ${isLiveActive ? 'bg-indigo-600/20' : 'bg-white/5'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isLiveActive ? 'bg-indigo-500 animate-pulse scale-110' : isEndpointActive ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                  {isLiveActive ? <Icons.Audio className="w-6 h-6 text-white" /> : <Icons.Brain className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h3 className="font-black text-white tracking-tight uppercase italic text-sm">
                    {isLiveActive ? 'Live Neural Link' : isEndpointActive ? 'Colab Synapse' : 'Neural Synapse'}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLiveActive ? 'bg-indigo-400' : 'bg-slate-500'}`} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {isLiveActive ? 'Real-time Audio Active' : 'Global Context Engaged'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={isLiveActive ? stopLiveSession : startLiveSession}
                  className={`p-3 rounded-xl transition-all ${isLiveActive ? 'bg-red-500 text-white' : 'bg-white/5 text-indigo-400 hover:bg-white/10'}`}
                  title={isLiveActive ? 'Terminate Link' : 'Initialize Voice Link'}
                >
                  {isLiveActive ? <Icons.Zap className="w-5 h-5" /> : <Icons.Audio className="w-5 h-5" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-3 text-slate-500 hover:text-white transition-all">
                  <Icons.Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {messages.length === 0 && !isLiveActive && (
                <div className="text-center py-24 px-6 space-y-6">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-inner">
                    <Icons.Chat className="w-8 h-8 text-slate-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-black uppercase italic tracking-tighter text-lg">Identity Verified</p>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-[240px] mx-auto">
                      Query the architect via text or initialize a <span className="text-indigo-400">Live Neural Link</span> for real-time synthesis.
                    </p>
                  </div>
                </div>
              )}
              {isLiveActive && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] animate-pulse" />
                    <div className="relative w-32 h-32 rounded-full border-2 border-indigo-500/50 flex items-center justify-center overflow-hidden">
                       <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 bg-indigo-500 rounded-full"
                       />
                    </div>
                  </div>
                  <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.4em] animate-pulse">Voice Interface Active</p>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative max-w-[85%] px-5 py-4 rounded-[1.75rem] text-sm leading-relaxed shadow-lg ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-none' 
                      : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}>
                    {m.text || <div className="flex gap-2 py-2"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" /><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150" /><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300" /></div>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-8 pt-0">
              <div className="relative group">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={isGuest ? "Identity sync required..." : "Communicate with the architect..."}
                  className={`w-full bg-slate-800/80 border border-white/10 rounded-2xl py-5 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 ${isGuest || isLiveActive ? 'cursor-not-allowed opacity-50' : ''}`}
                  disabled={isGuest || isTyping || isLiveActive}
                />
                <button 
                  onClick={handleSend}
                  disabled={isTyping || isLiveActive}
                  className={`absolute right-2.5 top-2.5 bottom-2.5 aspect-square rounded-xl flex items-center justify-center text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 ${isEndpointActive ? 'bg-emerald-600' : 'bg-indigo-600'}`}
                >
                  <Icons.ChevronRight className={`w-5 h-5 ${isTyping ? 'animate-pulse' : ''}`} />
                </button>
              </div>
              {isLiveActive && (
                <p className="text-center mt-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Standard input suppressed during live link</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: isLiveActive ? 0 : 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] transition-all border-t border-white/20 relative z-10 ${isLiveActive ? 'bg-red-500' : isEndpointActive ? 'bg-emerald-600' : 'bg-indigo-600'}`}
      >
        {isLiveActive ? <Icons.Zap className="w-10 h-10" /> : <Icons.Brain className="w-10 h-10" />}
        {isLiveActive && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default SynapseChat;
