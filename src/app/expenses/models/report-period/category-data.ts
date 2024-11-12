import { DataDetails } from "./data-details";
import { SupplierDTO } from "./SupplierDTO";

export interface CategoryData {
  category: string;
  type: string;
  data: DataDetails;
  supplierDTO: SupplierDTO;
  amountSupplier: number;
}
