export interface WorkerRequestDto {
  construction_id: number;
  address: string;
  contact: { contact_value: string };
  cuil: string;
  document: string;
  last_name: string;
  name: string;
  worker_speciality_type?: number;
  created_by?: number;
}

export interface WorkerResponseDTO {
  id: number;
}
