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


export interface RetentionKPIs {
  averageRetention: number;       // Promedio de retención general
  highestRetention: string;       // Suscripción con mayor retención
  lowestRetention: string;        // Suscripción con menor retención
  subscriptionsAbove80: number;   // Número de suscripciones con >80% retención
}

