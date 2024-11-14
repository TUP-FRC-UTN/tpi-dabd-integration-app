import { TicketDetail } from "./TicketDto";

export interface Top5 {
  topAmount: number;
  averageAmount: number;
  top5: TicketInfo[];
}

export interface TicketInfo {
  lot: string;
  period: string;
  totalAmount: number;
}

// export interface TicketInfo2 {
//   period: string;
//   totalAmount: number;
// }

export interface PeriodRequest  {
  startCreatedAt: string;
  endCreatedAt: string;
  paymentMethod: string;
  status: string;
}

export interface OtherReport {
  pending: number;
  paid: number;
  canceled: number;
  totalPaid: number;
  totalAveragePaid: number;
}

export interface TopPayments {
  byTransfer: number;
  totalByTransfer: number;
  percentageByTransfer: number;
  byMercadoPago: number;
  totalByMercadoPago: number;
  percentageByMercadoPago: number;
  preferredMethod: string;
  periods: TicketDetail[];
}

export interface TopPaymentsDetail {
  period: string,
  byTransfer: number;
  totalByTransfer: number;
  percentageByTransfer: number;
  byMercadoPago: number;
  totalByMercadoPago: number;
  percentageByMercadoPago: number;
}

export enum DashboardStatus {
  All = 'ALL',
  TOTAL = 'TOTAL',
  DISTRIBUTION = 'DISTRIBUTION',
}

export interface kpiModel{
  title:string,
  value:string,
  desc:string,
  icon: string,
  color: string,
}

export interface graphModel{
  title:string,
  subtitle:string,
  data:any[],
  options: any
}



