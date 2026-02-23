// MODEL — CommunityEvent
export type CommunityEvent = {
  id: string;
  name: string;
  type: 'celebration' | 'pride' | 'workshop' | 'cultural' | 'support-group' | 'information-session';
  description: string;
  date: string;
  time: string;
  location: string;
  organizer?: string;
  isFree: boolean;
  registration?: string;
  targetCommunities?: string[];
};
