import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Newspaper,
  Info,
  BookOpen,
  Wifi,
  WifiOff,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';

import type { AppPage, AnalysisState, ModelInfoResponse } from './types';
import * as api from './services/api';

import AnalysisWorkspace from './components/AnalysisWorkspace';
import PredictionPanel from './components/PredictionPanel';
import ExplanationPanel from './components/ExplanationPanel';
import ModelInfoPage from './components/ModelInfoPage';
import LimitationsPage from './components/LimitationsPage';
import AboutPage from './components/AboutPage';
import LoadingSpinner from './components/LoadingSpinner';
import Alert from './components/Alert';

function App() {
  const [page, setPage] = useState<AppPage>('analyze');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    prediction: null,
    explanation: null,
    error: null,
  });
  const [lastText, setLastText] = useState('');

  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [modelInfoLoading, setModelInfoLoading] = useState(false);
  const [modelInfoError, setModelInfoError] = useState<string | null>(null);

  // ── Backend health check ──────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        await api.checkHealth();
        setBackendStatus('ok');
      } catch {
        setBackendStatus('error');
      }
    };
    check();
  }, []);

  // ── Load model info when navigating to model page ─────────────────────────
  useEffect(() => {
    if (page === 'model' && !modelInfo && !modelInfoLoading) {
      setModelInfoLoading(true);
      setModelInfoError(null);
      api
        .fetchModelInfo()
        .then((info) => setModelInfo(info))
        .catch((err) => setModelInfoError(err.message))
        .finally(() => setModelInfoLoading(false));
    }
  }, [page, modelInfo, modelInfoLoading]);

  // ── Analysis flow ─────────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async (text: string) => {
    setLastText(text);
    setAnalysisState({ status: 'predicting', prediction: null, explanation: null, error: null });

    try {
      // Step 1: Predict
      const prediction = await api.predict(text);
      setAnalysisState((s) => ({ ...s, status: 'explaining', prediction }));

      // Step 2: Explain (may take several seconds)
      const explanation = await api.explain(text);
      setAnalysisState({ status: 'done', prediction, explanation, error: null });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error occurred.';
      setAnalysisState((s) => ({
        ...s,
        status: 'error',
        error: msg,
      }));
    }
  }, []);

  const isLoading =
    analysisState.status === 'predicting' || analysisState.status === 'explaining';

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems: { id: AppPage; label: string; icon: typeof Newspaper }[] = [
    { id: 'analyze',     label: 'Analyze News', icon: Newspaper },
    { id: 'model',       label: 'Model Info',   icon: Brain },
    { id: 'limitations', label: 'Limitations',  icon: AlertTriangle },
    { id: 'about',       label: 'About',        icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-surface-800/90 backdrop-blur-md border-b border-surface-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/50">
              <Brain size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-100 leading-none">
                Explainable Fake News Detection
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">AI Research Demo · Transformers + LIME</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`nav-${id}`}
                onClick={() => setPage(id)}
                className={clsx('nav-link', page === id && 'active')}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>

          {/* Backend status */}
          <div
            className={clsx(
              'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border shrink-0',
              backendStatus === 'ok'       && 'text-real-400 border-real-500/30 bg-real-500/10',
              backendStatus === 'error'    && 'text-fake-400 border-fake-500/30 bg-fake-500/10',
              backendStatus === 'checking' && 'text-slate-500 border-surface-500 bg-surface-700',
            )}
            title={
              backendStatus === 'ok'       ? 'Backend connected' :
              backendStatus === 'error'    ? 'Backend not reachable — start the FastAPI server' :
              'Checking backend…'
            }
          >
            {backendStatus === 'ok'       && <><Wifi size={11} /> Online</>}
            {backendStatus === 'error'    && <><WifiOff size={11} /> Offline</>}
            {backendStatus === 'checking' && <><LoadingSpinner size="sm" /> …</>}
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Backend offline warning */}
        {backendStatus === 'error' && page === 'analyze' && (
          <Alert type="error" title="Backend not reachable" className="mb-6">
            The FastAPI backend is not running. Start it with:
            <code className="block mt-2 bg-surface-900 px-3 py-2 rounded-lg text-xs font-mono text-slate-300">
              cd backend &amp;&amp; venv\Scripts\activate &amp;&amp; uvicorn app.main:app --reload
            </code>
          </Alert>
        )}

        {/* ── Analyze page ────────────────────────────────────────────────── */}
        {page === 'analyze' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left column: input + results */}
            <div className="space-y-6">
              <AnalysisWorkspace onAnalyze={handleAnalyze} isLoading={isLoading} />

              {/* Loading state */}
              {isLoading && (
                <div className="glass-card p-8 flex flex-col items-center gap-4">
                  <LoadingSpinner
                    size="lg"
                    label={
                      analysisState.status === 'predicting'
                        ? 'Running model inference…'
                        : 'Generating LIME explanation (this may take ~10–30s)…'
                    }
                  />
                  {analysisState.status === 'explaining' && analysisState.prediction && (
                    <p className="text-xs text-slate-500 text-center max-w-xs">
                      Initial prediction received. LIME is running{' '}
                      <strong className="text-slate-400">perturbation samples</strong> to identify
                      influential words…
                    </p>
                  )}
                </div>
              )}

              {/* Error state */}
              {analysisState.status === 'error' && (
                <Alert type="error" title="Analysis failed">
                  {analysisState.error}
                </Alert>
              )}

              {/* Prediction result (show immediately after predicting) */}
              {(analysisState.status === 'explaining' || analysisState.status === 'done') &&
                analysisState.prediction && (
                  <PredictionPanel prediction={analysisState.prediction} />
                )}
            </div>

            {/* Right column: explanation */}
            <div className="space-y-6">
              {analysisState.status === 'done' && analysisState.explanation && (
                <ExplanationPanel
                  explanation={analysisState.explanation}
                  originalText={lastText}
                />
              )}

              {analysisState.status === 'idle' && (
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-4 h-64">
                  <div className="w-12 h-12 rounded-2xl bg-brand-900/50 flex items-center justify-center">
                    <Info size={20} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium mb-1">No analysis yet</p>
                    <p className="text-slate-500 text-sm">
                      Enter a news article and click Analyze News. Both a prediction and LIME
                      word-level explanation will appear here.
                    </p>
                  </div>
                </div>
              )}

              {analysisState.status === 'explaining' && (
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-4 h-48">
                  <AlertCircle size={24} className="text-brand-400 animate-pulse-slow" />
                  <p className="text-slate-400 text-sm">
                    Generating LIME explanation… The word contribution chart will appear shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Model info page ─────────────────────────────────────────────── */}
        {page === 'model' && (
          <ModelInfoPage
            modelInfo={modelInfo}
            loading={modelInfoLoading}
            error={modelInfoError}
          />
        )}

        {/* ── Limitations page ─────────────────────────────────────────────── */}
        {page === 'limitations' && <LimitationsPage />}

        {/* ── About page ───────────────────────────────────────────────────── */}
        {page === 'about' && <AboutPage />}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-700 py-4 px-6 text-center text-xs text-slate-600">
        Educational Research Prototype · Predictions do not establish factual truth ·
        Model: hamzab/roberta-fake-news-classification · LIME explanations are local approximations
      </footer>
    </div>
  );
}

export default App;
