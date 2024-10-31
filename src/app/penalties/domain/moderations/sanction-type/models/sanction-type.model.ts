import { EntityBase } from '../../../../shared/models/entity-base.model';

export interface SanctionType extends EntityBase, SanctionTypeRequestDTO {}

export interface SanctionTypeRequestDTO {
  name: string;
  description: string;
  charge_type: ChargeTypeEnum;
  amount: number;
  infraction_days_to_expire: number;
  amount_of_infractions_for_fine: number;
}

export enum ChargeTypeEnum {
  PROPORTIONAL = 'Proporcional',
  FIXED = 'Fijo',
}
