export interface PredictionResponse {
  predicted_label: 'Fake' | 'Real';
  predicted_index: number;
  probabilities: Record<string, number>;
  model_id: string;
  device: string;
  truncated: boolean;
}

export interface WordContribution {
  word: string;
  weight: number;
  position: number;
}

export interface ExplanationResponse {
  predicted_label: 'Fake' | 'Real' | '';
  predicted_index: number;
  probabilities: Record<string, number>;
  contributions: WordContribution[];
  model_id: string;
  lime_num_samples: number;
  available: boolean;
  error: string | null;
}

export interface ModelInfoResponse {
  model_id: string;
  architecture: string;
  label_mapping: Record<string, string>;
  max_token_length: number;
  device: string;
  task: string;
  license_info: string;
  limitations: string[];
}

export interface HealthResponse {
  status: string;
  model_id: string;
}

export type AppPage = 'analyze' | 'model' | 'limitations' | 'about';

export interface AnalysisState {
  status: 'idle' | 'predicting' | 'explaining' | 'done' | 'error';
  prediction: PredictionResponse | null;
  explanation: ExplanationResponse | null;
  error: string | null;
}
