import { create } from 'zustand';

interface SurveyState {
  responses: Record<string, number>;
  setResponse: (criteria: string, score: number) => void;
  getResponse: (criteria: string) => number | undefined;
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  responses: {},
  setResponse: (criteria, score) => 
    set(state => ({ 
      responses: { ...state.responses, [criteria]: score } 
    })),
  getResponse: (criteria) => get().responses[criteria],
}))