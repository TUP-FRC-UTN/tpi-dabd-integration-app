import { ClaimDTO } from '../../claim/models/claim.model';
import { EntityBase } from '../../../../shared/models/entity-base.model';

export interface InfractionDto {
  plotId: number;
  description: string;
  sanctionTypeId: number;
  claimsId: number[];
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
  infraction_state: InfractionStatusEnum;
  plot_id: number;
  claims: ClaimDTO[];
}

export enum InfractionStatusEnum {
  ON_APPEALING = 'En apelación',
  APPROVED = 'Aprobado',
  REJECTED = 'Desestimado',
  CREATED = 'Creado',
}