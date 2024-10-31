export interface ConstructionDocResponseDto {
  state: string;
  document_identifier: string;
  documentation_type: string;
}

export interface ConstructionDocUpdateStatusRequestDto {
  documentation_id: number;
  status: string;
}