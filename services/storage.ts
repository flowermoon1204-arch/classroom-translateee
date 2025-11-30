import { BroadcastSegment, StudentQuestion } from "../types";

// Keys for local storage simulation
const KEY_BROADCAST = "classroom_broadcast_segment";
const KEY_QUESTIONS = "classroom_questions";
const KEY_ROOM_CODE = "classroom_active_room";

export const storageService = {
  // TEACHER: Broadcasts a text segment
  broadcastSegment: (text: string, isFinal: boolean) => {
    const segment: BroadcastSegment = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
      isFinal
    };
    localStorage.setItem(KEY_BROADCAST, JSON.stringify(segment));
    // Trigger storage event for other tabs
    window.dispatchEvent(new Event('storage'));
  },

  // STUDENT: Listens for broadcasts (Polling or Hook wrapper usually, but helper here)
  getLastSegment: (): BroadcastSegment | null => {
    const data = localStorage.getItem(KEY_BROADCAST);
    return data ? JSON.parse(data) : null;
  },

  // STUDENT: Asks a question
  postQuestion: (question: StudentQuestion) => {
    const existing = localStorage.getItem(KEY_QUESTIONS);
    const questions: StudentQuestion[] = existing ? JSON.parse(existing) : [];
    questions.push(question);
    localStorage.setItem(KEY_QUESTIONS, JSON.stringify(questions));
    window.dispatchEvent(new Event('storage'));
  },

  // TEACHER: Gets all questions
  getQuestions: (): StudentQuestion[] => {
    const data = localStorage.getItem(KEY_QUESTIONS);
    return data ? JSON.parse(data) : [];
  },

  // BOTH: Clear data for fresh session
  clearSession: () => {
    localStorage.removeItem(KEY_BROADCAST);
    localStorage.removeItem(KEY_QUESTIONS);
  }
};