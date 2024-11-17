import { SupplierDTO } from "./SupplierDTO";

export interface SupplierAmount {
  supplierDTO: SupplierDTO;
  totalAmount: number;
  average:number,
  percentage:number
}
