// MODEL — Resource
export type Resource = {
  id: string;
  name: string;
  category: 'food' | 'healthcare' | 'legal' | 'education' | 'housing' | 'childcare' | 'cultural' | 'mental-health' | 'advocacy';
  description: string;
  address: string;
  phone?: string;
  hours?: string;
  languages?: string[];
  distance?: string;
  website?: string;
  servingCommunities?: string[];
  accessibilityFeatures?: string[];
};
