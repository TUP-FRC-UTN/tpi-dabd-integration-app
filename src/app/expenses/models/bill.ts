import {Provider} from "./provider";
import Period from "./period";
import Category from "./category";
import BillType from "./billType";


export class Bill {
  expenditureId: number = 0;
  date: Date = new Date();
  amount: number = 0;
  description: string ="";
  supplier: Provider = new Provider();
  period: Period= new Period();
  category: Category = new Category();
  billType: BillType= new BillType();
  status: string= "";

  constructor(id:number, date: Date, amount: number, description: string, supplier: Provider, period: Period, category: Category, billType: BillType, status:string) {
    this.expenditureId = id!== undefined ? id:0;
    this.date = date !==undefined ? date: new Date();
    this.amount = amount? amount: 0;
    this.description = description? description : "";
    this.supplier=supplier;
    this.period = period;
    this.category = category;
    this.billType = billType ;
    this.status = status;
  }
}