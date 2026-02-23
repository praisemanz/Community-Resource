// STRATEGY PATTERN — Concrete Strategy: filter resources by free-text search
import type { FilterStrategy } from './FilterStrategy.ts';
import type { Resource } from '../../models/Resource.ts';

export class SearchFilterStrategy implements FilterStrategy<Resource> {
  constructor(private query: string) {}

  filter(resources: Resource[]): Resource[] {
    if (!this.query) return resources;
    const q = this.query.toLowerCase();
    return resources.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.servingCommunities?.some((c) => c.toLowerCase().includes(q))
    );
  }
}
