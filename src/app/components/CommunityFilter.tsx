import { X } from 'lucide-react';
import type { CommunityGroup } from '../models/CommunityGroup.ts';

export type { CommunityGroup };

type CommunityFilterProps = {
  selectedCommunities: CommunityGroup[];
  onCommunityToggle: (community: CommunityGroup) => void;
  onClearAll: () => void;
};

export function CommunityFilter({ selectedCommunities, onCommunityToggle, onClearAll }: CommunityFilterProps) {
  const communities: { id: CommunityGroup; label: string; selectedBg: string; selectedColor: string }[] = [
    { id: 'african-american',  label: 'African American',  selectedBg: '#4c1d95', selectedColor: '#ede9fe' },
    { id: 'hispanic-latino',   label: 'Hispanic/Latino',   selectedBg: '#92400e', selectedColor: '#fef3c7' },
    { id: 'asian-american',    label: 'Asian American',    selectedBg: '#991b1b', selectedColor: '#fee2e2' },
    { id: 'native-american',   label: 'Native American',   selectedBg: '#78350f', selectedColor: '#fef3c7' },
    { id: 'pacific-islander',  label: 'Pacific Islander',  selectedBg: '#164e63', selectedColor: '#cffafe' },
    { id: 'muslim',            label: 'Muslim',            selectedBg: '#14532d', selectedColor: '#dcfce7' },
    { id: 'sikh',              label: 'Sikh',              selectedBg: '#713f12', selectedColor: '#fef9c3' },
    { id: 'buddhist',          label: 'Buddhist',          selectedBg: '#312e81', selectedColor: '#e0e7ff' },
    { id: 'jewish',            label: 'Jewish',            selectedBg: '#1e3a5f', selectedColor: '#dbeafe' },
    { id: 'lgbtq',             label: 'LGBTQ+',            selectedBg: '#831843', selectedColor: '#fce7f3' },
    { id: 'refugee',           label: 'Refugee/Asylum',    selectedBg: '#134e4a', selectedColor: '#ccfbf1' },
    { id: 'immigrant',         label: 'Immigrant',         selectedBg: '#3b0764', selectedColor: '#f3e8ff' },
    { id: 'disability',        label: 'Disability',        selectedBg: '#1e293b', selectedColor: '#f1f5f9' },
  ];

  const hasSelection = selectedCommunities.length > 0 && !selectedCommunities.includes('all');

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Filter by Community</h3>
        {hasSelection && (
          <button
            onClick={onClearAll}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {communities.map((community) => {
          const isSelected = selectedCommunities.includes(community.id);
          return (
            <button
              key={community.id}
              onClick={() => onCommunityToggle(community.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={isSelected
                ? { backgroundColor: community.selectedBg, color: community.selectedColor, boxShadow: '0 1px 6px rgba(0,0,0,0.3)' }
                : { backgroundColor: 'var(--surface)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }
              }
            >
              {community.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
