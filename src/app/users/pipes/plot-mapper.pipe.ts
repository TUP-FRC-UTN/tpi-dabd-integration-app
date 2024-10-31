import { Pipe, PipeTransform } from '@angular/core';
import { Plot } from '../models/plot';

@Pipe({
  name: 'plotMapper',
  standalone: true
})
export class TransformPlotPipe implements PipeTransform {

  transform(plot: any): Plot {
    return {
      id: plot.id,
      plotNumber: plot.plot_number.toString(),
      blockNumber: plot.block_number.toString(),
      totalArea: plot.total_area.toString(),
      builtArea: plot.built_area.toString(),
      plotStatus: plot.plot_status,
      plotType: plot.plot_type,
      isActive: plot.is_active
    };
  }

}