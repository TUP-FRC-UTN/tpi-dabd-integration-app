export interface WorkerRequestDto {
  construction_id: number;
  address: string;
  doc_type: DocTypeEnum;
  document: string;
  last_name: string;
  name: string;
  worker_speciality_type?: number;
  created_by?: number;
}

export interface WorkerResponseDTO {
  id: number;
}

export enum DocTypeEnum {
  DNI = 'DNI',
  PASSPORT = 'Pasaporte',
  CUIL = 'CUIL',
  CUIT = 'CUIT',
}
