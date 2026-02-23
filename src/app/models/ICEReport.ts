// MODEL — ICEReport
export type ICEReport = {
  id: string;
  location: string;
  time: string;
  date: string;
  description: string;
  vehicleDescription?: string;
  numberOfOfficers?: string;
  isAnonymous: boolean;
  contactInfo?: string;
  timestamp: Date;
};
