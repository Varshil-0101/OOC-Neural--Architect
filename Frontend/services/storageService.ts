
import { Course, Note, Task, Exam, Credential, StudyMaterial, ProgressSnapshot } from '../types';

const STORAGE_KEYS = {
  COURSES: 'academia_courses',
  NOTES: 'academia_notes',
  TASKS: 'academia_tasks',
  EXAMS: 'academia_exams',
  CREDENTIALS: 'academia_credentials',
  MATERIALS: 'academia_materials',
  HISTORY: 'academia_learning_history'
};

const get = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const save = <T,>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
  getCourses: () => get<Course>(STORAGE_KEYS.COURSES),
  saveCourse: (course: Course) => {
    const courses = storageService.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index > -1) courses[index] = course;
    else courses.push(course);
    save(STORAGE_KEYS.COURSES, courses);
  },

  getNotes: () => get<Note>(STORAGE_KEYS.NOTES),
  saveNote: (note: Note) => {
    const notes = storageService.getNotes();
    const index = notes.findIndex(n => n.id === note.id);
    if (index > -1) notes[index] = note;
    else notes.push(note);
    save(STORAGE_KEYS.NOTES, notes);
  },
  
  getMaterials: () => get<StudyMaterial>(STORAGE_KEYS.MATERIALS),
  saveMaterial: (mat: StudyMaterial) => {
    const mats = storageService.getMaterials();
    const index = mats.findIndex(m => m.id === mat.id);
    if (index > -1) mats[index] = mat;
    else mats.push(mat);
    save(STORAGE_KEYS.MATERIALS, mats);
  },

  getLearningHistory: () => get<ProgressSnapshot>(STORAGE_KEYS.HISTORY),
  recordSnapshot: (snapshot: ProgressSnapshot) => {
    const history = storageService.getLearningHistory();
    const existingIndex = history.findIndex(h => h.date === snapshot.date);
    if (existingIndex > -1) history[existingIndex] = snapshot;
    else history.push(snapshot);
    // Keep last 30 days
    if (history.length > 30) history.shift();
    save(STORAGE_KEYS.HISTORY, history);
  },

  getTasks: () => get<Task>(STORAGE_KEYS.TASKS),
  saveTask: (task: Task) => {
    const tasks = storageService.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index > -1) tasks[index] = task;
    else tasks.push(task);
    save(STORAGE_KEYS.TASKS, tasks);
  },

  getExams: () => get<Exam>(STORAGE_KEYS.EXAMS),
  getCredentials: () => get<Credential>(STORAGE_KEYS.CREDENTIALS),

  exportAllData: () => {
    const data = {
      courses: storageService.getCourses(),
      notes: storageService.getNotes(),
      tasks: storageService.getTasks(),
      materials: storageService.getMaterials(),
      history: storageService.getLearningHistory(),
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neural-architect-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  },

  importAllData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.courses) save(STORAGE_KEYS.COURSES, data.courses);
      if (data.notes) save(STORAGE_KEYS.NOTES, data.notes);
      if (data.tasks) save(STORAGE_KEYS.TASKS, data.tasks);
      if (data.materials) save(STORAGE_KEYS.MATERIALS, data.materials);
      if (data.history) save(STORAGE_KEYS.HISTORY, data.history);
      return true;
    } catch (e) {
      console.error("Failed to import data", e);
      return false;
    }
  }
};
