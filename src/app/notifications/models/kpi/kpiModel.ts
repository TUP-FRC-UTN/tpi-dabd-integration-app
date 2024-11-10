export interface KPIModel {
  successRate: number;
  pendingRate: number;
  dailyAverage: number;
  mostUsedTemplate: {
    name: string;
    count: number;
  };
  peakHour: {
    hour: number;
    count: number;
  };
  mostFrequentContact: {
    email: string;
    count: number;
  };
  mostActiveDay: {
    day: string;
    count: number;
    percentage: number;
  };

}
