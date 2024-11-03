export interface Plot {
    id: number,
    plotNumber: string,
    blockNumber: string,
    totalArea: string,
    builtArea: string,
    plotStatus: string,
    plotType: string,
    isActive: boolean,
    balance: number
}

export const PlotTypeDictionary: { [key: string]: string } = {
    "Comercial": "COMMERCIAL",
    "Privado": "PRIVATE",
    "Comunal": "COMMUNAL"
};

export const PlotStatusDictionary: { [key: string]: string } = {
    "Creado": "CREATED",
    "En Venta": "FOR_SALE",
    "Venta": "SALE",
    "Proceso de Venta": "SALE_PROCESS",
    "En construcciones": "CONSTRUCTION_PROCESS",
    "Vacio": "EMPTY"
};

export enum PlotFilters {
    NOTHING = 'NOTHING',
    BLOCK_NUMBER = 'BLOCK_NUMBER',
    PLOT_STATUS = 'PLOT_STATUS',
    PLOT_TYPE = 'PLOT_TYPE'
  }