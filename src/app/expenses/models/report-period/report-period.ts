import { Expenditure } from "./expenditure";
import { Resume } from "./resume";

export interface ReportPeriod {
  expenditures:Expenditure;
  categories:Expenditure;
  suppliers:Expenditure;
  resume: Resume;
  periods: Resume[];
}
