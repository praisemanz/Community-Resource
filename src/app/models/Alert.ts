// MODEL — Alert
export type Alert = {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  icon?: 'ice' | 'weather' | 'safety';
  safetyTips?: string[];
  location?: string;
};
