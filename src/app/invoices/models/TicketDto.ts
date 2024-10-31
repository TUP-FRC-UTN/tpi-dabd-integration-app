export interface TicketDetail {
  id: number;
  description: string;  // Cambiado de 'name'
  amount: number;       // Cambiado de 'price', eliminando 'quantity'
}

export enum TicketStatus {
  PENDING = 'PENDIENTE',
  PAID = 'PAID',
  CANCELED = 'CANCELED'
}

export interface Owner{
  id: number,
  first_name: string,
  second_name: string,
  last_name: string
}

export interface TicketDto {
  id: number;                   // Cambiado de 'ticketNumber'
  ownerId: Owner;               // Cambiado de 'owner_id'
  issueDate: Date;               // Cambiado de 'emision_date'
  expirationDate: Date;          // Cambiado de 'expiration_date'
  status: TicketStatus;
  ticketNumber: string;
  lotId: number;
  ticketDetails: TicketDetail[]; // Cambiado de 'items'

}

export const PlotTypeDictionary: { [key: string]: string } = {
  "Pagado": "PAID",
  "Pendiente": "PENDING",
  "Cancelado": "CANCELED"
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