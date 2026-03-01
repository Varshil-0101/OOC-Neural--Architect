
export enum ConfidenceLevel {
  NEEDS_REVISION = 'NEEDS_REVISION',
  FAIR = 'FAIR',
  GOOD = 'GOOD',
  MASTERED = 'MASTERED'
}

export enum TaskPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum TaskType {
  HOMEWORK = 'HOMEWORK',
  PROJECT = 'PROJECT',
  READING = 'READING',
  REVISION = 'REVISION',
  CLASS = 'CLASS',
  EXAM = 'EXAM',
  STUDY_SESSION = 'STUDY_SESSION'
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  semester: number;
  color: string;
  resources: string[];
}

export interface Note {
  id: string;
  courseId: string;
  title: string;
  content: string;
  updatedAt: number;
  linkedTaskIds: string[];
  tags: string[];
  confidence: ConfidenceLevel;
  difficulty: number; // 1-5
}

export interface Task {
  id: string;
  title: string;
  courseId: string;
  dueDate: string;
  priority: TaskPriority;
  type: TaskType;
  completed: boolean;
  linkedNoteIds: string[];
  estimatedHours: number;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  date: string;
  room?: string;
}

export interface Insight {
  id: string;
  type: 'FORGOTTEN' | 'OVERLOAD' | 'RECOMMENDATION';
  title: string;
  description: string;
  actionLabel: string;
}

export interface Credential {
  id: string;
  name: string;
  value: string;
}

// New Types for Study Materials
export interface StudyMaterial {
  id: string;
  courseId: string;
  title: string;
  type: 'LECTURE' | 'PROBLEM_SET';
  content: string;
  completed: boolean;
  order: number;
  url?: string;
}

export interface ProgressSnapshot {
  date: string;
  score: number; // Calculated learning velocity
}
