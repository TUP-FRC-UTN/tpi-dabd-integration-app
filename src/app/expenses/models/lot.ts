export default class Lot {
    id: number = 0;
    plot_number: number = 0;
    block_number: number = 0;
  }

  export interface Lots {
    id:                     number;
    plot_number:            number;
    block_number:           number;
    total_area:             number;
    built_area:             number;
    plot_status:            string;
    plot_type:              string;
    percentage_for_expense: number;
}
