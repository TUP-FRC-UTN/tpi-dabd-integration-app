export class BillPostRequest {
  description: string = '';
  amount: number = 0;
  date: string = '';
  status: string = 'ACTIVE';
  categoryId: number = 0;
  supplierId: number = 0;
  supplierEmployeeType: string = 'SUPPLIER';
  typeId: number = 0;
  periodId: number = 0;
  linkPdf: string = '';
}

