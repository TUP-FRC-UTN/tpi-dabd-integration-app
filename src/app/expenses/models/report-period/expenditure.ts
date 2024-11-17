import { ExpenditureData } from "./expenditure-data";

export interface Expenditure {
    extraordinary: ExpenditureData;
    total: ExpenditureData;
    ordinary: ExpenditureData;
  }