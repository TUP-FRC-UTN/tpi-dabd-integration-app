export interface AccessRecordResponse {
  first_name: string;
  last_name: string;
  doc_number: number;
  entry_date_time: number[];
  exit_date_time: number[];
  car_description: string;
  vehicle_reg: string;
  vehicle_description: string;
  comments: string;
}

export interface AccessRecordProcessed {
  first_name: string;
  last_name: string;
  doc_number: number;
  entry_date_time: Date;
  exit_date_time: Date;
  car_description: string;
  vehicle_reg: string;
  vehicle_description: string;
  comments: string;
}

export interface AccessDTO {
  first_name: string;
  last_name: string;
  doc_number: number;
  action: string;
  vehicle_type: string;
  car_description?: string;
  vehicle_reg?: string;
  vehicle_description?: string;
  comments?: string;
}
