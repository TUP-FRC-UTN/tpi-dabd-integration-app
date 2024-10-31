import Period from "./period"

export default class Expense{
    lotId: number | null = null;
    period: Period = new Period();
    totalAmount: number = 0;
    liquidationDate: Date = new Date();
    state: string = "";
    plotNumber: number | null = null;
    typePlot: string = "";  
    percentage: number = 0;
    billType: string = "";
    month: string = "";
}
export enum ExpenseFilters {
    NOTHING = 'NOTHING',
    PERIOD_ID = 'PERIOD_ID',
    LOT_NUMBER = 'LOT_NUMBER',
    BILL_TYPE = 'BILL_TYPE'
  }