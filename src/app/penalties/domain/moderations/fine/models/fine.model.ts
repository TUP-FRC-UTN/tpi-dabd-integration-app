import { EntityBase } from '../../../../shared/models/entity-base.model';
import { FineStatusEnum } from './fine-status.enum';
import {
  InfractionDto,
  InfractionModel,
} from '../../infraction/models/infraction.model';
import { SanctionType } from '../../sanction-type/models/sanction-type.model';

export interface Fine extends EntityBase {
  plot_id: number;
  fine_state: FineStatusEnum;
  sanction_type: SanctionType;
  infractions: InfractionModel[];
}
