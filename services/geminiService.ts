
import { GoogleGenAI, Type } from "@google/genai";
import type { QAndA, QuestionWithOptions, Roadmap } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const questionGenerationConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  },
};

const roadmapGenerationConfig = {
    responseMimeType: "application/json",
    responseSchema: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                nodes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            type: { type: Type.STRING },
                            data: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING }
                                }
                            },
                            position: {
                                type: Type.OBJECT,
                                properties: {
                                    x: { type: Type.NUMBER },
                                    y: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                },
                edges: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            source: { type: Type.STRING },
                            target: { type: Type.STRING }
                        }
                    }
                }
            }
        }
    }
};


export const generateQuestion = async (history: QAndA[]): Promise<QuestionWithOptions> => {
  const historyText = history.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
  const prompt = `You are a career counselor AI. Your goal is to understand a user's interests, values, and skills. 
  Generate a single, insightful multiple-choice question to help determine a suitable career path. 
  Provide 4 distinct and meaningful options.
  Avoid generic questions. Make it thought-provoking.
  The user has already answered the following questions:
  ${historyText}

  Based on this, create the next question.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: questionGenerationConfig,
  });

  const jsonText = response.text.replace(/```json|```/g, '').trim();
  return JSON.parse(jsonText) as QuestionWithOptions;
};


export const generateRoadmaps = async (history: QAndA[]): Promise<Roadmap[]> => {
    const historyText = history.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
    const prompt = `You are an expert career strategist. Based on the following Q&A with a user, generate 3 distinct and detailed career roadmaps.
    For each roadmap, provide a title, a short description, and a series of steps as nodes and connections as edges, formatted for a flowchart.
    The output must be a JSON array of 3 roadmap objects.
    Each roadmap object must have 'title', 'description', 'nodes', and 'edges'.
    Nodes must have 'id', 'type' ('input' for the start, 'output' for the end, 'default' otherwise), 'data: { label: "..." }', and 'position: { x: ..., y: ... }'.
    Edges must have 'id', 'source', and 'target'.
    Arrange the node positions in a clear, top-to-bottom vertical flow. Start with y=0, and increment y by 100 for each subsequent level. Keep x values consistent for a clean vertical line, e.g., x=250.
    
    Here's the user's Q&A:
    ${historyText}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: roadmapGenerationConfig,
    });
    
    const jsonText = response.text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonText) as Roadmap[];
};

export const generateMentorIntro = async (careerPath: string): Promise<string> => {
    const prompt = `You are a helpful and experienced AI mentor specializing in the field of ${careerPath}. 
    Create a warm, encouraging, and brief introductory message (2-3 sentences) to start a simulated video call with a user who is new to this field. 
    Your response should be plain text, ready to be spoken.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
};
