import { type FC, useState, useRef, useCallback } from 'react';
import { Send, Trash2, Sparkles, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';

const MAX_CHARS = 5000;
const MIN_CHARS = 10;

const EXAMPLES = [
  {
    label: 'Example: Plausible real news',
    text: 'The Federal Reserve raised interest rates by 25 basis points on Wednesday, citing persistent inflation and a resilient labor market. Fed Chair Jerome Powell noted that officials remain committed to bringing inflation back to the 2% target while monitoring economic conditions closely.',
  },
  {
    label: 'Example: Suspicious claim',
    text: 'BREAKING: Scientists have proven that drinking warm lemon water every morning can cure cancer, diabetes, and arthritis simultaneously. Major pharmaceutical companies have been suppressing this information for decades to protect their profits.',
  },
  {
    label: 'Example: Political news',
    text: 'Congress passed a bipartisan infrastructure bill worth $1.2 trillion on Tuesday, authorizing spending on roads, bridges, broadband internet, and water systems. The legislation now heads to the president for signature.',
  },
];

interface AnalysisWorkspaceProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const AnalysisWorkspace: FC<AnalysisWorkspaceProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validate = useCallback((value: string): string | null => {
    if (value.trim().length < MIN_CHARS) return `Please enter at least ${MIN_CHARS} characters.`;
    if (value.length > MAX_CHARS) return `Text exceeds ${MAX_CHARS} character limit.`;
    if (value.trim().split(/\s+/).length < 5) return 'Please enter at least 5 words.';
    return null;
  }, []);

  const handleSubmit = () => {
    const err = validate(text);
    if (err) { setError(err); return; }
    setError(null);
    onAnalyze(text.trim());
  };

  const handleChange = (v: string) => {
    setText(v);
    if (error) setError(validate(v));
  };

  const handleExample = (exText: string) => {
    setText(exText);
    setError(null);
    setShowExamples(false);
    textareaRef.current?.focus();
  };

  const remaining = MAX_CHARS - text.length;
  const isOverLimit = text.length > MAX_CHARS;

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">News Article Input</h2>
        <button
          id="examples-btn"
          onClick={() => setShowExamples((s) => !s)}
          className="btn-secondary text-xs py-1.5"
        >
          <Sparkles size={13} />
          Examples
          <ChevronDown
            size={13}
            className={clsx('transition-transform duration-200', showExamples && 'rotate-180')}
          />
        </button>
      </div>

      {/* Examples dropdown */}
      {showExamples && (
        <div className="glass-card-inner p-3 space-y-2 animate-fade-in">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExample(ex.text)}
              className="w-full text-left p-3 rounded-lg hover:bg-surface-600 transition-colors text-xs"
            >
              <p className="text-brand-300 font-medium mb-1">{ex.label}</p>
              <p className="text-slate-400 line-clamp-2">{ex.text}</p>
            </button>
          ))}
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="news-input"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Paste a news headline or full article here…"
          rows={8}
          disabled={isLoading}
          className={clsx(
            'w-full resize-none bg-surface-700 border rounded-xl px-4 py-3 text-sm text-slate-200',
            'placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500',
            'transition-all duration-200 font-mono leading-relaxed',
            isOverLimit ? 'border-fake-500' : 'border-surface-500 focus:border-brand-500',
            isLoading && 'opacity-60 cursor-not-allowed',
          )}
        />
        <div
          className={clsx(
            'absolute bottom-3 right-3 text-xs font-mono',
            isOverLimit ? 'text-fake-400' : remaining < 200 ? 'text-amber-400' : 'text-slate-600',
          )}
        >
          {text.length}/{MAX_CHARS}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-fake-400 flex items-center gap-1.5">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          id="analyze-btn"
          onClick={handleSubmit}
          disabled={isLoading || isOverLimit}
          className="btn-primary flex-1 justify-center py-3"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Analyzing…
            </>
          ) : (
            <>
              <Send size={16} />
              Analyze News
            </>
          )}
        </button>
        <button
          id="clear-btn"
          onClick={() => { setText(''); setError(null); }}
          disabled={isLoading || text.length === 0}
          className="btn-secondary p-3"
          title="Clear input"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default AnalysisWorkspace;
