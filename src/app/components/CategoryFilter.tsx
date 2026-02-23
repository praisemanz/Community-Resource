import { UtensilsCrossed, Heart, Scale, GraduationCap, Home, Baby, Globe, Brain, Megaphone, Calendar } from 'lucide-react';
import type { Category } from '../models/Category.ts';

export type { Category };

type CategoryFilterProps = {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
};

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories: { id: Category; label: string; icon: typeof UtensilsCrossed }[] = [
    { id: 'all', label: 'All Resources', icon: Home },
    { id: 'food', label: 'Food', icon: UtensilsCrossed },
    { id: 'healthcare', label: 'Healthcare', icon: Heart },
    { id: 'legal', label: 'Legal Aid', icon: Scale },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'housing', label: 'Housing', icon: Home },
    { id: 'childcare', label: 'Childcare', icon: Baby },
    { id: 'cultural', label: 'Cultural Centers', icon: Globe },
    { id: 'mental-health', label: 'Mental Health', icon: Brain },
    { id: 'advocacy', label: 'Advocacy', icon: Megaphone },
    { id: 'events', label: 'Community Events', icon: Calendar },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm"
            style={isSelected
              ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }
              : { backgroundColor: 'var(--surface)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }
            }
          >
            <Icon size={16} />
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
