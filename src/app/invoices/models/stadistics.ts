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

export interface PeriodRequest  {
  firstDate: string;
  lastDate: string;
  action: string;
  group: string;
  type: string;
  dataType: string;
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
}

export enum DashboardStatus {
  All = 'ALL',
  Types = 'TYPES'
}


