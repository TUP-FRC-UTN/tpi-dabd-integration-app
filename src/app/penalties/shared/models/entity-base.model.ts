import { InfractionDto } from '../../domain/moderations/infraction/models/infraction.model';

export interface EntityBase {
  id: number;
  created_date: string;
  created_by: number;
  last_updated_at: string;
  last_updated_by: number;
}
