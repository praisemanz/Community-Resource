import { Search } from 'lucide-react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder = 'Search resources...' }: SearchBarProps) {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{ color: 'var(--primary)' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none transition-all"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          boxShadow: '0 0 0 0 var(--primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid var(--primary)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-light)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
