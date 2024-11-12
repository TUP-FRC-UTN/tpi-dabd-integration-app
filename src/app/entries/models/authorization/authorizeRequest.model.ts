export interface VisitorRequest {
  name: string;
  lastName: string;
  docType: string;
  docNumber: number;
  birthDate: string;
}

export interface AuthRangeRequest {
  dateFrom: string;
  dateTo: string;
  hourFrom: string;
  hourTo: string;
  daysOfWeek: DaysOfWeek[];
  comment: string;
}

export interface VisitorAuthorizationRequest {
  visitorType: VisitorType;
  plotId: number;
  visitorRequest: VisitorRequest;
  authRangeRequest: AuthRangeRequest[];
}

export enum VisitorType {
  OWNER = 'OWNER',
  WORKER = 'WORKER',
  VISITOR = 'VISITOR',
  EMPLOYEE = 'EMPLOYEE',
  PROVIDER = 'PROVIDER',
  PROVIDER_ORGANIZATION = 'PROVIDER_ORGANIZATION',
  COHABITANT = 'COHABITANT',
  EMERGENCY = 'EMERGENCY',
}

export enum DaysOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}
