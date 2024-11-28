import { DaysOfWeek } from './authorizeRequest.model';

export interface AuthRange {
  authRangeId: number;
  dateFrom: string;
  dateTo: string;
  hourFrom: string;
  hourTo: string;
  daysOfWeek: DaysOfWeek[];
  comment: string;
  isActive: boolean;
}

export interface Visitor {
  visitorId: number;
  name: string;
  lastName: string | null;
  docType: string;
  docNumber: number;
  birthDate: string;
  isActive: boolean;
}

export interface Authorizer {
  authorizerId: number;
  authFirstName: string;
  authLastName: string | null;
}

export interface Auth {
  authId: number;
  plotId: number | null;
  visitor: Visitor;
  visitorType: string;
  externalId: number | null;
  authRanges: AuthRange[];
  isActive: boolean;
  authorizerId: number;
  authFirstName: string;
  authLastName: string | null;
  ownerName?: string;
  ownerLastName?: string;
}

export const VisitorTypeAccessDictionary: { [key: string]: string } = {
  Visitante: 'VISITOR',
  Proveedor: 'PROVIDER',
  Propietario: 'OWNER',
  Trabajador: 'WORKER',
  Empleado: 'EMPLOYEE',
  Conviviente: 'COHABITANT',
  Emergencia: 'EMERGENCY',
  Entidad: 'PROVIDER_ORGANIZATION',
};

export const VisitorTypeDictionary: { [key: string]: string } = {
  VISITOR: 'Visitante',
  PROVIDER: 'Proveedor',
  OWNER: 'Propietario',
  WORKER: 'Trabajador',
  EMPLOYEE: 'Empleado',
  COHABITANT: 'Cohabitante',
  EMERGENCY: 'Emergencia',
  PROVIDER_ORGANIZATION: 'Entidad',
};

export const VisitorTypeIconDictionary: { [key: string]: string } = {
  VISITOR: 'bi-person',
  PROVIDER: 'bi-truck',
  OWNER: 'bi-house-door',
  WORKER: 'bi-wrench',
  EMPLOYEE: 'bi-briefcase',
  COHABITANT: 'bi-people-fill',
  EMERGENCY: 'bi-exclamation-triangle-fill',
  PROVIDER_ORGANIZATION: 'bi-building',
};

export enum AuthFilters {
  NOTHING = 'NOTHING',
  PLOT_ID = 'Nro de lote',
  VISITOR_TYPE = 'VISITOR_TYPE',
}
