// STRATEGY PATTERN — Concrete Strategy: filter resources by community group
import type { FilterStrategy } from './FilterStrategy.ts';
import type { Resource } from '../../models/Resource.ts';
import type { CommunityGroup } from '../../models/CommunityGroup.ts';

export class CommunityFilterStrategy implements FilterStrategy<Resource> {
  constructor(
    private selectedCommunities: CommunityGroup[],
    private communityMap: Record<string, CommunityGroup>
  ) {}

  filter(resources: Resource[]): Resource[] {
    if (this.selectedCommunities.includes('all')) {
      return resources;
    }
    return resources.filter((r) =>
      r.servingCommunities?.some((comm) => {
        const id = this.communityMap[comm];
        return id !== undefined && this.selectedCommunities.includes(id);
      })
    );
  }
}
