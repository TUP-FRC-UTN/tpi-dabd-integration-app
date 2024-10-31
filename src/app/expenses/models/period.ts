

export default class Period {
  id: number = 0;
  month: number = 0;
  year: number = 0;
  state:string="";
  start_date: Date = new Date();
  end_date: Date = new Date();
  extraordinary?: PeriodLiquidationExpense = {name: "", amount: 0};
  ordinary?: PeriodLiquidationExpense = {name: "", amount: 0};
}


interface PeriodLiquidationExpense {
  name: string;
  amount: number;
}
