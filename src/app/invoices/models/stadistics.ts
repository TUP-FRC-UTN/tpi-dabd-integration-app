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
}

export interface OtherReport {
  pending: number;
  paid: number;
  canceled: number;
  totalPaid: number;
  totalAveragePaid: number;
}

