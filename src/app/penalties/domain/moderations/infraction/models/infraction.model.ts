import { ClaimDTO } from '../../claim/models/claim.model';
import { EntityBase } from '../../../../shared/models/entity-base.model';

export interface InfractionDto {
  plot_id: number;
  description: string;
  sanction_type_id: number;
  claims_ids: number[];
}

export interface InfractionModel extends EntityBase {
  plot_id: number;
  description: string;
  sanctionTypeId: number;
  claims: ClaimDTO[];
  fine_id: number;
}

export interface InfractionResponseDTO {
  id: number;
  fine_id: number;
  createdBy: number;
  created_date: Date;
  description: string;
  infraction_status: InfractionStatusEnum;
  plot_id: number;
  claims: ClaimDTO[];
  proofs: Proof[];
  notes: any[];
}

export enum InfractionStatusEnum {
  APPEALED = 'Apelada',
  APPROVED = 'Aprobado',
  REJECTED = 'Desestimado',
  CREATED = 'Creado',
}

export type InfractionTab = 'claims' | 'proofs' | 'notes';

export interface Proof extends EntityBase {
  document_identifier: string;
}
