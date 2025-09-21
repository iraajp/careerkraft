import type { Node, Edge } from 'reactflow';

export enum AppState {
  LOGIN,
  SIGNUP,
  DASHBOARD,
  WELCOME,
  QUESTIONNAIRE,
  GENERATING_ROADMAPS,
  VIEWING_ROADMAPS,
  AWAITING_CALL_DETAILS,
  MENTOR_CALL,
}

export interface QuestionWithOptions {
  question: string;
  options: string[];
}

export interface QAndA {
  question: string;
  answer: string;
}

export interface Roadmap {
  title: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

export interface User {
  id: string;
  email: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  userId: string;
}

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Extend the Window interface to include ReactFlow from the CDN
declare global {
  interface Window {
    ReactFlow: any;
  }
}