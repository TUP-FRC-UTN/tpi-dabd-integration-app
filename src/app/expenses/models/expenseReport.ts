import Expense from "./expense";
import Period from "./period";

export interface expenseReport {
  expenses: Expense[];
  totalAmount: number;
  // Cambiamos de Map a objetos regulares
  totalAmountPerPeriod: { [key: string]: number };
  totalAmountPerTypePlot: { [key: string]: number };
  averageAmount: number;
  totalPlots: number;
  typesPlots: number;
  percentages: number[];
}
