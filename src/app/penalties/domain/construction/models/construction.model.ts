export interface ConstructionRequestDto {
  description: string;
  plot_id: number;
  planned_start_date: Date;
  planned_end_date: Date;
  project_name: string;
}

export interface ConstructionUpdateRequestDto {
  description: string;
  planned_start_date: string;
  planned_end_date: string;
  project_name: string;
  start_time: string;
  end_time: string;
}

export interface ConstructionResponseDto {
  construction_id: number;
  plot_id: number;
  planned_start_date: string;
  actual_start_date: string;
  planned_end_date: string;
  actual_end_date: null;
  project_description: string;
  approved_by_municipality: boolean;
  project_name: string;
  project_address: string;
  construction_status: string;
  notes: any[];
  construction_documentation: any[];
  workers: any[];
  start_time: any;
  end_time: any;
}

export interface ConstructionUpdateStatusRequestDto {
  construction_id: number;
  status: string;
}

export type ConstructionTab = 'documentation' | 'workers' | 'notes';

export type ConstructionStatus =
  | 'ON_REVISION'
  | 'PLANNED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'STOPPED';

export const CONSTRUCTION_STATUSES: ConstructionStatus[] = [
  'PLANNED',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
  'STOPPED',
  'ON_REVISION',
];

export enum CONSTRUCTION_STATUSES_ENUM {
  LOADING = 'En proceso de carga',
  PLANNED = 'En planeación',
  APPROVED = 'Aprobada',
  REJECTED = 'Rechazada',
  IN_PROGRESS = 'En progreso',
  COMPLETED = 'Completada',
  STOPPED = 'Frenada',
  ON_REVISION = 'En revisión',
}
