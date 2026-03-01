
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  Calendar, 
  Brain, 
  Plus, 
  Settings, 
  MessageSquare, 
  FileText, 
  Clock, 
  Zap,
  ChevronRight,
  Search,
  MoreVertical,
  Volume2,
  Trash2,
  Save,
  ChevronLeft,
  User,
  Book,
  Activity,
  Award,
  Check,
  Sun,
  Moon
} from 'lucide-react';

export const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#06b6d4', // Cyan
];

export const Icons = {
  Dashboard: LayoutDashboard,
  Courses: BookOpen,
  Tasks: CheckSquare,
  Calendar: Calendar,
  Brain: Brain,
  Plus: Plus,
  Settings: Settings,
  Chat: MessageSquare,
  Notes: FileText,
  Clock: Clock,
  Zap: Zap,
  ChevronRight: ChevronRight,
  ChevronLeft: ChevronLeft,
  Search: Search,
  Menu: MoreVertical,
  Audio: Volume2,
  Delete: Trash2,
  Save: Save,
  User: User,
  Book: Book,
  Activity: Activity,
  Award: Award,
  Check: Check,
  Sun: Sun,
  Moon: Moon
};

export const IT_CURRICULUM: Record<number, { name: string; description: string }[]> = {
  1: [
    { name: 'Programming Fundamentals', description: 'Logic & C/C++ basics.' },
    { name: 'Discrete Mathematics', description: 'Math for CS.' },
    { name: 'Intro to IT', description: 'Hardware & software.' },
    { name: 'Professional Communication', description: 'Soft skills.' }
  ],
  2: [
    { name: 'Linear Algebra', description: 'Groups, Fields, Matrices, and Vector Spaces.' },
    { name: 'Data Structures', description: 'Arrays, trees, graphs.' },
    { name: 'OOP with Java', description: 'Classes & objects.' },
    { name: 'Computer Architecture', description: 'CPU & memory.' }
  ],
  3: [
    { name: 'Algorithm Analysis', description: 'Big-O & sorting.' },
    { name: 'Operating Systems', description: 'Processes & memory.' },
    { name: 'Digital Electronics', description: 'Logic gates.' },
    { name: 'Computer Graphics', description: 'Rendering.' }
  ],
  4: [
    { name: 'Database Systems', description: 'SQL & modeling.' },
    { name: 'Software Engineering', description: 'SDLC & Agile.' },
    { name: 'Theory of Computation', description: 'Automata.' },
    { name: 'Web Technologies', description: 'HTML/CSS/JS.' }
  ],
  5: [
    { name: 'Computer Networks', description: 'TCP/IP.' },
    { name: 'Artificial Intelligence', description: 'Search & logic.' },
    { name: 'Cybersecurity', description: 'Threats & crypto.' },
    { name: 'Unix Administration', description: 'Shell & servers.' }
  ],
  6: [
    { name: 'Machine Learning', description: 'ML models.' },
    { name: 'Cloud Computing', description: 'AWS & Azure.' },
    { name: 'Mobile Development', description: 'Android/iOS.' },
    { name: 'Data Mining', description: 'Patterns in data.' }
  ],
  7: [
    { name: 'IoT', description: 'Sensors & devices.' },
    { name: 'Big Data Analytics', description: 'Spark & Hadoop.' },
    { name: 'Blockchain', description: 'Ledgers.' },
    { name: 'Parallel Computing', description: 'Multicore.' }
  ],
  8: [
    { name: 'Capstone Project', description: 'Final project.' },
    { name: 'NLP', description: 'Language models.' },
    { name: 'HCI', description: 'UX & psychology.' },
    { name: 'Ethics in IT', description: 'Law & privacy.' }
  ]
};
