export interface ConstructionDocumentationTypeResponseDTO {
  name: string;
  id: number;
  description: string;
}

export interface NewConstructionDocumentationDTO {
  documentation_type_id: number;
  construction_id: number;
  created_by: number;
}
