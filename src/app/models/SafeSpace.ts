// MODEL — SafeSpace
export type SafeSpace = {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: 'sanctuary' | 'shelter' | 'community-center';
  available24h: boolean;
};
