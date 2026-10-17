import { type FC } from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-[3px]',
  lg: 'w-10 h-10 border-4',
};

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = 'md', label, className }) => (
  <div className={clsx('flex flex-col items-center gap-3', className)}>
    <div
      className={clsx(
        'rounded-full border-brand-700 border-t-brand-400 animate-spin',
        sizeClasses[size],
      )}
      role="status"
      aria-label={label ?? 'Loading'}
    />
    {label && <p className="text-sm text-slate-400">{label}</p>}
  </div>
);

export default LoadingSpinner;
