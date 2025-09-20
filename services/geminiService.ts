import type { QAndA, QuestionWithOptions, Roadmap } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://your-backend-app.railway.app' : 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const generateQuestion = (history: QAndA[]): Promise<QuestionWithOptions> => {
  return fetch(`${API_BASE_URL}/api/generate-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history }),
  }).then(handleResponse<QuestionWithOptions>);
};

export const generateRoadmaps = (history: QAndA[]): Promise<Roadmap[]> => {
  return fetch(`${API_BASE_URL}/api/generate-roadmaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history }),
  }).then(handleResponse<Roadmap[]>);
};