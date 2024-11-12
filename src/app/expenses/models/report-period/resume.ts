import { Period } from "./period";
import { CategoryData } from "./category-data";
import { SupplierAmount } from "./SupplierAmount";

export interface Resume {
  period: Period;
  ordinary: CategoryData[];
  extraordinary: CategoryData[];
  supplier_ordinary: SupplierAmount[];
  supplier_extraordinary: SupplierAmount[];
}
