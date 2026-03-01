
import { Task, Course, Note, Exam, TaskPriority } from '../types';

export const getRankedTasks = (
  tasks: Task[],
  courses: Course[],
  notes: Note[],
  exams: Exam[]
): Task[] => {
  return [...tasks]
    .filter(t => !t.completed)
    .sort((a, b) => {
      const scoreA = calculateScore(a, exams);
      const scoreB = calculateScore(b, exams);
      return scoreB - scoreA;
    });
};

const calculateScore = (task: Task, exams: Exam[]): number => {
  let score = 0;

  // Priority Score
  const priorityWeights = {
    [TaskPriority.CRITICAL]: 100,
    [TaskPriority.HIGH]: 70,
    [TaskPriority.MEDIUM]: 40,
    [TaskPriority.LOW]: 10
  };
  score += priorityWeights[task.priority];

  // Time Score
  const daysUntil = (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, (10 - daysUntil) * 5);

  // Proximity to Exam
  const courseExam = exams.find(e => e.courseId === task.courseId);
  if (courseExam) {
    const examDays = (new Date(courseExam.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (examDays < 7) score += 50;
  }

  return score;
};
