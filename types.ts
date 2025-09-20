
import type { Node, Edge } from 'reactflow';

export enum AppState {
  WELCOME,
  QUESTIONNAIRE,
  GENERATING_ROADMAPS,
  VIEWING_ROADMAPS,
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

// Extend the Window interface to include ReactFlow from the CDN
declare global {
  interface Window {
    ReactFlow: any;
  }
}
