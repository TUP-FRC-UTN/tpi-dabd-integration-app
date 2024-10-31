import { EntityBase } from '../../../../shared/models/entity-base.model';

export interface Plot extends EntityBase {
  plot_number: number;
  block_number: number;
  plot_status: string;
  plot_type: string;
}
