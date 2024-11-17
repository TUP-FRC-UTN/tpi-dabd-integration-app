import { Period } from "./period";
import { CategoryData } from "./category-data";
import { SupplierAmount } from "./SupplierAmount";

export interface Resume {
  period: Period;
  ordinary: CategoryData[];
  extraordinary: CategoryData[];
  supplierOrdinary: SupplierAmount[];
  supplierExtraordinary: SupplierAmount[];
}
