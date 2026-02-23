// STRATEGY PATTERN — Concrete Strategy: filter resources by category
import type { FilterStrategy } from './FilterStrategy.ts';
import type { Resource } from '../../models/Resource.ts';
import type { Category } from '../../models/Category.ts';

export class CategoryFilterStrategy implements FilterStrategy<Resource> {
  constructor(private category: Category) {}

  filter(resources: Resource[]): Resource[] {
    if (this.category === 'all' || this.category === 'events') {
      return resources;
    }
    return resources.filter((r) => r.category === this.category);
  }
}
