import { type FC } from 'react';
import { Brain, Cpu, Tag, FileText, Shield } from 'lucide-react';
import type { ModelInfoResponse } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ModelInfoPageProps {
  modelInfo: ModelInfoResponse | null;
  loading: boolean;
  error: string | null;
}

const ModelInfoPage: FC<ModelInfoPageProps> = ({ modelInfo, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" label="Loading model information…" />
      </div>
    );
  }

  if (error || !modelInfo) {
    return (
      <div className="glass-card p-8 text-center text-slate-400">
        <p className="text-fake-400 mb-2">⚠ Could not load model information</p>
        <p className="text-sm">{error ?? 'Backend may not be running.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <Brain size={20} className="text-brand-400" />
          Model Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Model ID */}
          <div className="glass-card-inner p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
              <Tag size={12} /> Model Identifier
            </div>
            <p className="font-mono text-sm text-brand-300 break-all">{modelInfo.model_id}</p>
            <a
              href={`https://huggingface.co/${modelInfo.model_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-400 hover:underline"
            >
              View on Hugging Face →
            </a>
          </div>

          {/* Architecture */}
          <div className="glass-card-inner p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
              <Brain size={12} /> Architecture
            </div>
            <p className="text-sm text-slate-200 font-mono">{modelInfo.architecture}</p>
            <p className="text-xs text-slate-500">Max sequence: {modelInfo.max_token_length} tokens</p>
          </div>

          {/* Device */}
          <div className="glass-card-inner p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
              <Cpu size={12} /> Inference Device
            </div>
            <p className="text-sm font-mono text-slate-200">{modelInfo.device}</p>
            <p className="text-xs text-slate-500">
              {modelInfo.device.includes('cuda')
                ? 'GPU acceleration active'
                : 'Running on CPU — inference may take 1–3s'}
            </p>
          </div>

          {/* Task */}
          <div className="glass-card-inner p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
              <FileText size={12} /> Task
            </div>
            <p className="text-sm text-slate-200">{modelInfo.task}</p>
          </div>
        </div>
      </div>

      {/* Label mapping */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Tag size={15} className="text-brand-400" /> Verified Label Mapping
        </h3>
        <div className="flex gap-3">
          {Object.entries(modelInfo.label_mapping).map(([idx, name]) => (
            <div
              key={idx}
              className={`glass-card-inner px-4 py-2 text-sm font-mono ${
                name === 'Fake' ? 'label-fake' : 'label-real'
              }`}
            >
              <span className="text-slate-500 mr-2">index {idx}:</span>
              <strong>{name}</strong>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Verified by loading the model config and checking <code className="text-brand-300">id2label</code>.
        </p>
      </div>

      {/* Limitations */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Shield size={15} className="text-amber-400" /> Model Limitations
        </h3>
        <ul className="space-y-2">
          {modelInfo.limitations.map((lim, i) => (
            <li key={i} className="text-sm text-slate-400 flex gap-2">
              <span className="text-amber-500 shrink-0 mt-0.5">•</span>
              {lim}
            </li>
          ))}
        </ul>
      </div>

      {/* License */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">License &amp; Attribution</h3>
        <p className="text-sm text-slate-400">{modelInfo.license_info}</p>
      </div>
    </div>
  );
};

export default ModelInfoPage;
