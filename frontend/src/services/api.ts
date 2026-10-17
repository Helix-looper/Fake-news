import type {
  ExplanationResponse,
  HealthResponse,
  ModelInfoResponse,
  PredictionResponse,
} from '../types';

const BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/health`);
  return handleResponse<HealthResponse>(res);
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const res = await fetch(`${BASE}/model-info`);
  return handleResponse<ModelInfoResponse>(res);
}

export async function predict(text: string): Promise<PredictionResponse> {
  const res = await fetch(`${BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return handleResponse<PredictionResponse>(res);
}

export async function explain(text: string): Promise<ExplanationResponse> {
  const res = await fetch(`${BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return handleResponse<ExplanationResponse>(res);
}
