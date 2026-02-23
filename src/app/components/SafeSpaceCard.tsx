import { Shield, MapPin, Phone } from 'lucide-react';
import type { SafeSpace } from '../models/SafeSpace.ts';

export type { SafeSpace };

type SafeSpaceCardProps = {
  space: SafeSpace;
};

export function SafeSpaceCard({ space }: SafeSpaceCardProps) {
  return (
    <div
      className="rounded-xl p-5 transition-all hover:shadow-xl"
      style={{
        backgroundColor: 'var(--surface)',
        background: 'linear-gradient(135deg, var(--primary-light), var(--teal-light))',
        border: '1px solid var(--primary)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield style={{ color: 'var(--primary)' }} size={24} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{space.name}</h3>
        </div>
        {space.available24h && (
          <span
            className="px-2 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            24/7
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(space.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start group transition-colors"
          style={{ color: 'var(--foreground-muted)' }}
        >
          <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0 group-hover:text-current transition-colors" style={{ color: 'var(--primary)' }} />
          <span className="underline-offset-2 group-hover:underline">{space.address}</span>
        </a>

        <div className="flex items-center">
          <Phone size={16} className="mr-2 flex-shrink-0" style={{ color: 'var(--primary)' }} />
          <a href={`tel:${space.phone}`} className="font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--foreground)' }}>
            {space.phone}
          </a>
        </div>

        <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
          <span
            className="text-xs font-medium uppercase tracking-widest px-2 py-1 rounded-full"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            {space.type.replace('-', ' ')}
          </span>
        </div>
      </div>
    </div>
  );
}
