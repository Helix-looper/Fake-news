import { type FC, type ReactNode } from 'react';
import { AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: ReactNode;
  className?: string;
}

const config = {
  info:    { icon: Info,          classes: 'bg-brand-900/30 border-brand-700 text-brand-300' },
  warning: { icon: AlertTriangle, classes: 'bg-amber-900/30 border-amber-700 text-amber-300' },
  error:   { icon: XCircle,       classes: 'bg-fake-500/10 border-fake-500/30 text-fake-400' },
  success: { icon: CheckCircle,   classes: 'bg-real-500/10 border-real-500/30 text-real-400' },
};

const Alert: FC<AlertProps> = ({ type, title, children, className }) => {
  const { icon: Icon, classes } = config[type];
  return (
    <div className={clsx('flex gap-3 p-4 rounded-xl border', classes, className)}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="text-sm">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
