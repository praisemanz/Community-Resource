// UX Principle: Visibility of System Status
// Briefly confirms the result of user actions (success, error, info) then auto-dismisses.
import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export type ToastData = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastProps = {
  toast: ToastData;
  onDismiss: (id: string) => void;
};

const config: Record<ToastType, { icon: typeof CheckCircle; bg: string; border: string; iconColor: string }> = {
  success: { icon: CheckCircle, bg: 'rgba(16,185,129,0.1)', border: '#10b981', iconColor: '#10b981' },
  error:   { icon: AlertCircle, bg: 'rgba(220,38,38,0.1)',  border: '#dc2626', iconColor: '#dc2626' },
  info:    { icon: Info,        bg: 'var(--primary-light)', border: 'var(--primary)', iconColor: 'var(--primary)' },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const [exiting, setExiting] = useState(false);
  const { icon: Icon, bg, border, iconColor } = config[toast.type];

  useEffect(() => {
    const exit = setTimeout(() => setExiting(true), 3200);
    const remove = setTimeout(() => onDismiss(toast.id), 3600);
    return () => { clearTimeout(exit); clearTimeout(remove); };
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border-l-4 min-w-[280px] max-w-sm transition-all duration-300"
      style={{
        backgroundColor: bg,
        borderLeftColor: border,
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateX(20px)' : 'translateX(0)',
      }}
    >
      <Icon size={20} style={{ color: iconColor, flexShrink: 0 }} />
      <p className="flex-1 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
        {toast.message}
      </p>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300); }}
        className="hover:opacity-60 transition-opacity"
        aria-label="Dismiss notification"
        style={{ color: iconColor }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

type ToastContainerProps = {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
};

// Fixed bottom-left stack — away from the back-to-top button (bottom-right)
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
