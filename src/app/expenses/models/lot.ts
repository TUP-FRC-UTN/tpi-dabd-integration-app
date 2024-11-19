export default class Lot {
    id: number = 0;
    plot_number: number = 0;
    block_number: number = 0;
  }

  export interface Lots {
    id:                     number;
    plotNumber:            number;
    blockNumber:           number;
    totalArea:             number;
    builtArea:             number;
    plotStatus:            string;
    plotType:              string;
    percentageForExpense: number;
}

