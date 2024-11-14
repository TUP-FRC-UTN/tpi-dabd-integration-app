export interface KPIModel {
  pendingRate: number;
  viewedRate: number;
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

export interface RetentionMetric {
  subscriptionName: string;
  totalUsers: number;
  activeUsers: number;
  retentionRate: number;
}
