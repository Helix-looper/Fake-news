import { type FC, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ExplanationResponse } from '../types';
import Alert from './Alert';
import clsx from 'clsx';

interface ExplanationPanelProps {
  explanation: ExplanationResponse;
  originalText: string;
}

const ExplanationPanel: FC<ExplanationPanelProps> = ({ explanation, originalText }) => {
  const [showAll, setShowAll] = useState(false);

  if (!explanation.available) {
    return (
      <Alert type="error" title="Explanation unavailable">
        {explanation.error ?? 'LIME explanation could not be generated for this input.'}
      </Alert>
    );
  }

  const contributions = explanation.contributions;
  const displayed = showAll ? contributions : contributions.slice(0, 12);

  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.weight)), 0.001);

  // Build highlighted text: mark words by their LIME weight
  const wordMap = new Map<string, number>();
  contributions.forEach((c) => {
    wordMap.set(c.word.toLowerCase(), c.weight);
  });

  const tokens = originalText.split(/(\s+)/);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Legend */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200">
            LIME Word Contributions
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {explanation.lime_num_samples} perturbations
          </span>
        </div>

        <div className="flex gap-4 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-fake-500 opacity-80" />
            Supports «{explanation.predicted_label}» prediction
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-real-500 opacity-80" />
            Against «{explanation.predicted_label}» prediction
          </span>
        </div>

        {/* Bar chart */}
        <ResponsiveContainer width="100%" height={Math.max(contributions.slice(0, 12).length * 32, 200)}>
          <BarChart
            layout="vertical"
            data={displayed.map((c) => ({
              name: c.word,
              value: c.weight,
            }))}
            margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
          >
            <XAxis
              type="number"
              domain={[-maxAbs * 1.1, maxAbs * 1.1]}
              tickFormatter={(v: number) => v.toFixed(2)}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1e1e2a',
                border: '1px solid #32324a',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '12px',
              }}
              formatter={(v: number) => [v.toFixed(4), 'Weight']}
            />
            <ReferenceLine x={0} stroke="#4a4a6a" strokeDasharray="3 3" />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {displayed.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.weight > 0 ? '#f43f5e' : '#22c55e'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {contributions.length > 12 && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="mt-3 text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            {showAll ? 'Show fewer' : `Show all ${contributions.length} words`}
          </button>
        )}
      </div>

      {/* Highlighted text */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">
          Highlighted Article Text
        </h3>
        <div className="flex gap-4 text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1.5">
            <span className="px-1 rounded bg-fake-500/25 border border-fake-500/40 text-fake-400">word</span>
            Supports fake
          </span>
          <span className="flex items-center gap-1.5">
            <span className="px-1 rounded bg-real-500/20 border border-real-500/30 text-real-400">word</span>
            Supports real
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-7 font-mono break-words">
          {tokens.map((token, i) => {
            const clean = token.toLowerCase().replace(/[.,!?;:"'()[\]{}]/g, '');
            const weight = wordMap.get(clean) ?? wordMap.get(token.toLowerCase());
            if (weight === undefined || /^\s+$/.test(token)) {
              return <span key={i}>{token}</span>;
            }
            const intensity = Math.min(Math.abs(weight) / maxAbs, 1);
            const isFakeWord = weight > 0;
            return (
              <span
                key={i}
                title={`Weight: ${weight.toFixed(4)}`}
                className={clsx(
                  'px-0.5 rounded transition-all cursor-default',
                  isFakeWord
                    ? 'text-fake-300 border border-fake-500/20'
                    : 'text-real-300 border border-real-500/20',
                )}
                style={{
                  backgroundColor: isFakeWord
                    ? `rgba(244, 63, 94, ${0.1 + intensity * 0.35})`
                    : `rgba(34, 197, 94, ${0.1 + intensity * 0.3})`,
                }}
              >
                {token}
              </span>
            );
          })}
        </p>
      </div>

      <Alert type="info" title="About LIME explanations">
        LIME perturbs the input text ({explanation.lime_num_samples} times), observes how the
        model's output probability changes, and fits a local linear model to identify which words
        were most influential for <em>this specific prediction</em>. Positive weights (red)
        push toward «{explanation.predicted_label}»; negative weights (green) push against it.
        These are local approximations — not global feature importances.
      </Alert>
    </div>
  );
};

export default ExplanationPanel;
