/**
 * Represents a plot with various attributes such as plot and block numbers, area, and status.
 */
export interface Plot {
  /** Unique identifier of the plot */
  id: number;
  /** Plot number identifier */
  plotNumber: string;
  /** Block number identifier associated with the plot */
  blockNumber: string;
  /** Total area of the plot */
  totalArea: string;
  /** Built-up area on the plot */
  builtArea: string;
  /** Status of the plot, e.g., for sale or under construction */
  plotStatus: string;
  /** Type of the plot, e.g., commercial or private */
  plotType: string;
  /** Indicates if the plot is active */
  isActive: boolean;
}

/**
 * Dictionary for mapping plot types to their respective string representations.
 */
export const PlotTypeDictionary: { [key: string]: string } = {
  Comercial: 'COMMERCIAL',
  Privado: 'PRIVATE',
  Comunal: 'COMMUNAL',
};

/**
 * Dictionary for mapping plot statuses to their respective string representations.
 */
export const PlotStatusDictionary: { [key: string]: string } = {
  Creado: 'CREATED',
  'En Venta': 'FOR_SALE',
  Venta: 'SALE',
  'Proceso de Venta': 'SALE_PROCESS',
  'En construcciones': 'CONSTRUCTION_PROCESS',
  Vacio: 'EMPTY',
};

/**
 * Enumeration representing possible filters for plots.
 */
export enum PlotFilters {
  /** No filter applied */
  NOTHING = 'NOTHING',
  /** Filter by block number */
  BLOCK_NUMBER = 'BLOCK_NUMBER',
  /** Filter by plot status */
  PLOT_STATUS = 'PLOT_STATUS',
  /** Filter by plot type */
  PLOT_TYPE = 'PLOT_TYPE',
}
