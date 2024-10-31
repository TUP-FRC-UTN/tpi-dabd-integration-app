import { FineStatusEnum } from './fine-status.enum';

export interface UpdateFineStateDTO {
  id: number | undefined;
  fineState: FineStatusEnum;
  updatedBy: number;
}
