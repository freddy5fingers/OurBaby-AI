export interface PredictionResult {
  infantBoy: string | null;
  infantGirl: string | null;
  toddlerBoy: string | null;
  toddlerGirl: string | null;
  childBoy: string | null;
  childGirl: string | null;
  teenBoy: string | null;
  teenGirl: string | null;
  analysis: string;
}

export interface ParentImage {
  id: 'parent1' | 'parent2';
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
}

export type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error';
