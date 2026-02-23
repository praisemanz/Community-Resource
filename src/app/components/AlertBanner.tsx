import { AlertTriangle, X, Cloud, Shield, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { Alert } from '../models/Alert.ts';

export type { Alert };

type AlertBannerProps = {
  alert: Alert;
  onDismiss: (id: string) => void;
};

const alertStyles = {
  urgent: {
    bg: 'rgba(220,38,38,0.08)',
    border: '#dc2626',
    text: '#dc2626',
    icon: '#dc2626',
  },
  warning: {
    bg: 'rgba(217,119,6,0.08)',
    border: '#d97706',
    text: '#d97706',
    icon: '#d97706',
  },
  info: {
    bg: 'var(--primary-light)',
    border: 'var(--primary)',
    text: 'var(--primary)',
    icon: 'var(--primary)',
  },
};

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(alert.id), 400);
  };

  const styles = alertStyles[alert.type];
  const Icon = alert.icon === 'weather' ? Cloud : alert.icon === 'safety' ? Shield : AlertTriangle;

  return (
    <div
      className="border-l-4 p-4 mb-4 rounded-r-xl transition-all duration-400 overflow-hidden"
      style={{
        backgroundColor: styles.bg,
        borderLeftColor: styles.border,
        opacity: isExiting ? 0 : 1,
        maxHeight: isExiting ? 0 : '500px',
        transform: isExiting ? 'translateX(16px)' : 'translateX(0)',
        marginBottom: isExiting ? 0 : undefined,
        paddingTop: isExiting ? 0 : undefined,
        paddingBottom: isExiting ? 0 : undefined,
      }}
      role="alert"
    >
      <div className="flex items-start">
        <Icon size={20} className="mr-3 mt-0.5 flex-shrink-0" style={{ color: styles.icon }} />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{alert.title}</h3>
              {alert.location && (
                <p className="text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>📍 {alert.location}</p>
              )}
              <p className="text-sm mb-1" style={{ color: 'var(--foreground-muted)' }}>{alert.message}</p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)', opacity: 0.7 }}>
                {alert.timestamp.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="ml-4 flex-shrink-0 p-1 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: styles.icon }}
              aria-label="Dismiss alert"
            >
              <X size={18} />
            </button>
          </div>

          {alert.safetyTips && alert.safetyTips.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: styles.border,
                  color: '#ffffff',
                  boxShadow: `0 2px 8px ${styles.border}55`,
                }}
                aria-expanded={showDetails}
              >
                <Shield size={14} />
                How to Stay Safe
                <span className="text-xs opacity-80">{showDetails ? '▲' : '▼'}</span>
              </button>

              {showDetails && (
                <div className="mt-3 rounded-xl p-3" style={{ backgroundColor: `${styles.border}12`, border: `1px solid ${styles.border}40` }}>
                  <ul className="space-y-2">
                    {alert.safetyTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                          style={{ backgroundColor: styles.border }}
                        >
                          {index + 1}
                        </span>
                        <span className="leading-snug" style={{ color: 'var(--foreground)' }}>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
