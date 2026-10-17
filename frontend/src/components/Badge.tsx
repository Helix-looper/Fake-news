import { type FC } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  label: 'Fake' | 'Real';
  size?: 'sm' | 'md' | 'lg';
}

const Badge: FC<BadgeProps> = ({ label, size = 'md' }) => {
  const isFake = label === 'Fake';
  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded-lg border',
        isFake ? 'label-fake' : 'label-real',
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'md' && 'text-sm px-3 py-1',
        size === 'lg' && 'text-base px-4 py-1.5',
      )}
    >
      {label === 'Fake' ? '⚠ Likely Fake' : '✓ Likely Real'}
    </span>
  );
};

export default Badge;
