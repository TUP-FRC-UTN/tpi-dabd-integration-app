import { InfractionDto } from '../../domain/moderations/infraction/models/infraction.model';

export interface EntityBase {
  id: number;
  created_date: Date;
  created_by: number;
  last_updated_at: Date;
  last_updated_by: number;
}
