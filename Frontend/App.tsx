
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import TodoView from './components/TodoView';
import ProfileView from './components/ProfileView';
import SynapseChat from './components/SynapseChat';
import IntroPage from './components/IntroPage';
import AuthView from './components/AuthView';
import BackgroundSlideshow from './components/BackgroundSlideshow';
import FloatingNodes from './components/FloatingNodes';
import StudyMaterialView from './components/StudyMaterialView';
import NoteEditor from './components/NoteEditor';
import { storageService } from './services/storageService';
import { getRankedTasks } from './services/priorityEngine';
import { Course, Task, Note, StudyMaterial } from './types';
import { COLORS, Icons, IT_CURRICULUM } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [courseTab, setCourseTab] = useState<'nodes' | 'lattice' | 'diary'>('lattice');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [appState, setAppState] = useState<'intro' | 'initialize' | 'ready'>('intro');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const [selectedSemester, setSelectedSemester] = useState<number | null>(() => {
    const saved = localStorage.getItem('academia_semester');
    return saved ? parseInt(saved, 10) : null;
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('academia_logged_in') === 'true');
  const [instituteName] = useState(() => localStorage.getItem('academia_institute') || 'Neural Academy');

  useEffect(() => {
    if (appState !== 'ready') return;

    const loadedCourses = storageService.getCourses();
    const filtered = loadedCourses.filter(c => c.semester === selectedSemester);

    if (filtered.length === 0 && selectedSemester !== null) {
      const curriculum = IT_CURRICULUM[selectedSemester] || [];
      const initialCourses: Course[] = curriculum.map((subject, index) => ({
        id: `c${index + 1}-${selectedSemester}`,
        name: subject.name,
        color: COLORS[index % COLORS.length],
        description: subject.description,
        semester: selectedSemester,
        resources: []
      }));
      initialCourses.forEach(c => storageService.saveCourse(c));
      setCourses(loadedCourses.concat(initialCourses));
    } else {
      setCourses(loadedCourses);
    }
    setNotes(storageService.getNotes());
    setTasks(storageService.getTasks());
    setMaterials(storageService.getMaterials());
  }, [selectedSemester, appState]);

  const filteredCourses = useMemo(() => courses.filter(c => c.semester === selectedSemester), [courses, selectedSemester]);
  const activeCourse = useMemo(() => courses.find(c => c.id === activeCourseId), [courses, activeCourseId]);

  const priorityTasks = useMemo(() => {
    const semesterIds = new Set(filteredCourses.map(c => c.id));
    return getRankedTasks(tasks.filter(t => semesterIds.has(t.courseId) || t.courseId === 'general'), filteredCourses, notes, []);
  }, [tasks, filteredCourses, notes]);

  const requireAuth = (callback: () => void) => {
    if (!isLoggedIn) {
      setAuthMode('signup');
      setIsAuthOpen(true);
    } else {
      callback();
    }
  };

  const handleNavigate = (view: string, courseId: string | null = null) => {
    if (view === 'dashboard') {
      setActiveView(view);
      setActiveCourseId(null);
      return;
    }
    
    requireAuth(() => {
      setActiveView(view);
      setActiveCourseId(courseId);
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('academia_logged_in', 'false');
    setActiveView('dashboard');
    setActiveCourseId(null);
    // Show sign up menu again for registration
    setAuthMode('signup');
    setIsAuthOpen(true);
  };

  const handleToggleTask = (id: string) => {
    requireAuth(() => {
      const task = tasks.find(t => t.id === id);
      if (task) {
        const updated = { ...task, completed: !task.completed };
        storageService.saveTask(updated);
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
      }
    });
  };

  const handleToggleMaterial = (id: string) => {
    requireAuth(() => {
      const mat = materials.find(m => m.id === id);
      if (mat) {
        const updated = { ...mat, completed: !mat.completed };
        storageService.saveMaterial(updated);
        setMaterials(prev => prev.map(m => m.id === id ? updated : m));
      }
    });
  };

  const handleAddMaterial = (m: StudyMaterial) => {
    requireAuth(() => {
      storageService.saveMaterial(m);
      setMaterials(prev => [...prev, m]);
    });
  };

  const handleAddTask = (t: Partial<Task>) => {
    requireAuth(() => {
      const newTask = t as Task;
      storageService.saveTask(newTask);
      setTasks(prev => [...prev, newTask]);
    });
  };

  const handleCreateNote = () => {
    if (!activeCourse) return;
    requireAuth(() => {
      const newNote: Note = { 
        id: crypto.randomUUID(), 
        courseId: activeCourse.id, 
        title: 'New Entry', 
        content: '', 
        updatedAt: Date.now(), 
        linkedTaskIds: [], 
        confidence: 'FAIR' as any, 
        difficulty: 3, 
        tags: [] 
      };
      setEditingNote(newNote);
    });
  };

  const handleSaveNote = (note: Note) => {
    storageService.saveNote(note);
    setNotes(prev => {
      const exists = prev.find(n => n.id === note.id);
      if (exists) return prev.map(n => n.id === note.id ? note : n);
      return [...prev, note];
    });
    setEditingNote(null);
  };

  return (
    <div className="relative min-h-screen w-full transition-colors duration-500 overflow-hidden bg-slate-950 text-slate-200">
      <BackgroundSlideshow />
      <FloatingNodes />

      <AnimatePresence mode="wait">
        {isAuthOpen && (
          <AuthView 
            key="auth-modal"
            mode={authMode} 
            onSuccess={() => { setIsLoggedIn(true); localStorage.setItem('academia_logged_in', 'true'); setIsAuthOpen(false); }}
            onBack={() => setIsAuthOpen(false)}
            onSwitchMode={(mode) => setAuthMode(mode)}
          />
        )}

        {editingNote && activeCourse && (
          <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-3xl">
            <NoteEditor 
              note={editingNote} 
              course={activeCourse} 
              linkedTasks={[]} 
              allTasks={tasks} 
              onSave={handleSaveNote}
              onClose={() => setEditingNote(null)}
            />
          </div>
        )}

        {appState === 'intro' && (
          <IntroPage key="intro" onStart={() => setAppState('initialize')} />
        )}

        {appState === 'initialize' && (
          <motion.div 
            key="init"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-4xl w-full premium-glass p-20 rounded-[4rem] border-white/10 text-center space-y-16 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 blur-[120px] rounded-full" />
              <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/20 blur-[120px] rounded-full" />

              <div className="space-y-6 relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em]">System Calibration</p>
                <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none uppercase">
                  Which <span className="text-indigo-500">Phase</span><br/>Are You In?
                </h1>
                <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto">
                  Select your current semester to initialize the knowledge mapping sequence.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem, i) => (
                  <motion.button 
                    key={sem}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => { 
                      setSelectedSemester(sem); 
                      localStorage.setItem('academia_semester', sem.toString()); 
                      setAppState('ready'); 
                    }}
                    className={`p-10 notion-card text-center group ${selectedSemester === sem ? 'bg-indigo-600 border-indigo-400' : ''}`}
                  >
                    <span className="text-4xl font-black text-white block mb-2">{sem}</span>
                    <span className="text-[8px] font-black text-slate-500 group-hover:text-indigo-200 uppercase tracking-widest">Semester</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {appState === 'ready' && (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen w-full overflow-hidden">
            <Sidebar 
              courses={filteredCourses} 
              activeView={activeView} 
              activeCourseId={activeCourseId}
              onNavigate={handleNavigate}
              onAddCourse={() => handleNavigate('initialize')}
            />
            
            <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-950/40 backdrop-blur-3xl">
              <div className="absolute top-10 right-12 z-[60] flex items-center gap-6">
                <AnimatePresence>
                  {isLoggedIn && (
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onClick={handleLogout}
                      className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-3"
                    >
                      <Icons.Zap className="w-3 h-3" />
                      Sign Out
                    </motion.button>
                  )}
                </AnimatePresence>
                
                <button 
                  onClick={() => handleNavigate('profile')} 
                  className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-all border border-blue-400/30"
                >
                  <Icons.User className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeView + activeCourseId} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 overflow-y-auto custom-scrollbar"
                >
                  {activeView === 'dashboard' && <Dashboard priorityTasks={priorityTasks} allTasks={tasks} notes={notes} materials={materials} onCompleteTask={handleToggleTask} instituteName={instituteName} selectedSemester={selectedSemester!} onRequireAuth={() => handleNavigate('signup')} />}
                  {activeView === 'todo' && <TodoView tasks={tasks} courses={filteredCourses} onAddTask={handleAddTask} onCompleteTask={handleToggleTask} isAdding={isAddingTask} setIsAdding={setIsAddingTask} isLoggedIn={isLoggedIn} onRequireAuth={() => handleNavigate('signup')} />}
                  {activeView === 'calendar' && <CalendarView tasks={tasks} exams={[]} courses={filteredCourses} onAddTask={handleAddTask} />}
                  {activeView === 'profile' && <ProfileView instituteName={instituteName} semester={selectedSemester!} courses={filteredCourses} tasks={tasks} notes={notes} onReset={() => { localStorage.clear(); window.location.reload(); }} />}
                  {activeView === 'course' && activeCourse && (
                    <div className="flex h-full">
                      <div className="flex-1 p-16 md:p-24 space-y-12 max-w-7xl mx-auto">
                        <header className="space-y-4">
                          <div className="w-16 h-1 rounded-full" style={{ backgroundColor: activeCourse.color }} />
                          <h2 className="text-7xl font-black text-white tracking-tighter italic uppercase leading-[0.85]">{activeCourse.name}</h2>
                          <p className="text-slate-500 text-xl font-medium max-w-4xl leading-relaxed">{activeCourse.description}</p>
                          
                          <div className="flex gap-4 p-1 bg-white/5 w-fit rounded-2xl border border-white/5 mt-8 overflow-x-auto no-scrollbar">
                            <button 
                              onClick={() => setCourseTab('lattice')}
                              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${courseTab === 'lattice' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
                            >
                              Lecture Notes & Sets
                            </button>
                            <button 
                              onClick={() => setCourseTab('diary')}
                              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${courseTab === 'diary' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
                            >
                              Personal Diary
                            </button>
                            <button 
                              onClick={() => setCourseTab('nodes')}
                              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${courseTab === 'nodes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
                            >
                              Synthesized Nodes
                            </button>
                          </div>
                        </header>
                        
                        <AnimatePresence mode="wait">
                          {courseTab === 'lattice' ? (
                            <motion.div
                              key="lattice"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                            >
                              <StudyMaterialView 
                                materials={materials.filter(m => m.courseId === activeCourse.id)} 
                                courses={[activeCourse]} 
                                onToggleMaterial={handleToggleMaterial} 
                                onAddMaterial={handleAddMaterial}
                                isCompact
                                onRequireAuth={() => handleNavigate('signup')}
                              />
                            </motion.div>
                          ) : (
                            <motion.div 
                              key={courseTab}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                              {notes.filter(n => n.courseId === activeCourse.id).map(note => (
                                <motion.div 
                                  key={note.id} 
                                  whileHover={{ y: -5 }}
                                  onClick={() => setEditingNote(note)}
                                  className="notion-card p-10 space-y-6 cursor-pointer border-transparent hover:border-indigo-500/30"
                                >
                                  <div className="flex items-center gap-2">
                                     {courseTab === 'diary' ? <Icons.Notes className="w-4 h-4 text-indigo-400" /> : <Icons.Zap className="w-4 h-4 text-purple-400" />}
                                     <h4 className="font-black text-2xl text-white tracking-tight">{note.title}</h4>
                                  </div>
                                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">{note.content || 'Awaiting entry...'}</p>
                                  <div className="pt-4 flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <Icons.Clock className="w-3 h-3" />
                                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                                  </div>
                                </motion.div>
                              ))}
                              
                              <button 
                                onClick={handleCreateNote}
                                className="p-10 rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-600 hover:border-indigo-500/50 hover:text-indigo-400 transition-all group min-h-[280px]"
                              >
                                <Icons.Plus className="w-10 h-10 mb-4 transition-transform group-hover:rotate-90" />
                                <span className="font-black text-[10px] uppercase tracking-[0.3em]">
                                  {courseTab === 'diary' ? 'Write Personal Entry' : 'Synthesize New Node'}
                                </span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <SynapseChat 
                onRequireAuth={() => handleNavigate('signup')} 
                isGuest={!isLoggedIn} 
                allNotes={notes}
              />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
