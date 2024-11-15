import {ChartType} from "chart.js";
// import {dashResponse} from "../services/dashboard.service";

export interface DashboardHourlyDTO {
  key: string;
  value: number;
}

export interface DashboardWeeklyDTO {
  key: string;
  value: number;
  secondaryValue: number;
}

export interface AccessData {
  key: string;
  value: number;
}

export interface ChartState {
  hasData: boolean;
  message: string;
}

export interface EntryReport {
  entryCount: number;
  exitCount: number;
}

export interface KpiModel {
  title:string,
  value:string,
  desc:string,
  icon: string,
  color: string,
}

export interface GraphModel{
  title:string,
  subtitle:string,
  data:any[],
  options: any
}

export enum DashboardOwnerStatus {
  All = 'ALL',
  Person = "PERSON",
  Company = "COMPANY",
  Other = "OTHER",
}

export interface OwnerDashboardFilter {
    dateFrom: string;
    dateTo: string;
    ownerType: string;
}
