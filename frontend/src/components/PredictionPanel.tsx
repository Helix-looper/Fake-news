import { type FC } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { PredictionResponse } from '../types';
import Badge from './Badge';
import Alert from './Alert';

interface PredictionPanelProps {
  prediction: PredictionResponse;
}

const PredictionPanel: FC<PredictionPanelProps> = ({ prediction }) => {
  const isFake = prediction.predicted_label === 'Fake';
  const confidence = prediction.probabilities[prediction.predicted_label] ?? 0;
  const confidencePct = Math.round(confidence * 100);

  const chartData = [
    {
      name: prediction.predicted_label,
      value: confidencePct,
      fill: isFake ? '#f43f5e' : '#22c55e',
    },
  ];

  return (
    <div className="glass-card p-6 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">
            Classification Result
          </p>
          <Badge label={prediction.predicted_label} size="lg" />
        </div>
        <div className="text-right text-xs text-slate-500 font-mono">
          <p>Model</p>
          <p className="text-slate-400 max-w-[180px] truncate" title={prediction.model_id}>
            {prediction.model_id.split('/').pop()}
          </p>
          <p className="mt-1">Device: {prediction.device}</p>
          {prediction.truncated && (
            <p className="text-amber-400 mt-1">⚠ Input truncated to 512 tokens</p>
          )}
        </div>
      </div>

      {/* Probability gauge */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card-inner p-4 flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={120}>
            <RadialBarChart
              cx="50%"
              cy="70%"
              innerRadius="60%"
              outerRadius="90%"
              barSize={10}
              data={chartData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: '#27273a' }}
                dataKey="value"
                angleAxisId={0}
                cornerRadius={8}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e1e2a',
                  border: '1px solid #32324a',
                  borderRadius: '8px',
                  color: '#cbd5e1',
                  fontSize: '12px',
                }}
                formatter={(v: number) => [`${v}%`, 'Confidence']}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className={`text-2xl font-bold -mt-4 ${isFake ? 'text-fake-500' : 'text-real-500'}`}>
            {confidencePct}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Confidence</p>
        </div>

        {/* All class probabilities */}
        <div className="glass-card-inner p-4 flex flex-col justify-center gap-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Class Probabilities
          </p>
          {Object.entries(prediction.probabilities).map(([cls, prob]) => {
            const pct = Math.round(prob * 100);
            const isTarget = cls === prediction.predicted_label;
            const isCls = cls === 'Fake';
            return (
              <div key={cls}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isTarget ? (isCls ? 'text-fake-400' : 'text-real-400') : 'text-slate-400'}>
                    {cls}
                  </span>
                  <span className="text-slate-300 font-mono">{(prob * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCls ? 'bg-fake-500' : 'bg-real-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interpretation */}
      <Alert type={isFake ? 'warning' : 'info'} title="How to interpret this result">
        The model assigns a <strong>{confidencePct}%</strong> probability that this content
        is <strong>{prediction.predicted_label}</strong>. This is a statistical estimate
        based on linguistic patterns learned during training —{' '}
        <strong>not a factual verification</strong>. High confidence does not mean the
        claim is objectively false or true. Always consult authoritative sources.
      </Alert>

      {/* Limitations collapsible */}
      <details className="group glass-card-inner">
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none text-sm text-slate-400 hover:text-slate-300">
          <span className="font-medium">Model limitations &amp; disclaimer</span>
          <span className="text-xs group-open:rotate-180 transition-transform">▾</span>
        </summary>
        <div className="px-4 pb-4 text-xs text-slate-500 space-y-1">
          <p>• Performance may degrade on short headlines or non-English text.</p>
          <p>• Fine-tuned on a specific dataset; may not generalise to all domains.</p>
          <p>• The model reflects statistical biases present in its training corpus.</p>
          <p>• This is a research prototype and should not be used as a sole fact-checking tool.</p>
        </div>
      </details>
    </div>
  );
};

export default PredictionPanel;
