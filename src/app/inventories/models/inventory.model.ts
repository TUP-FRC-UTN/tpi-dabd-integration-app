import { Article } from "./article.model";

// Agregar nuevo modelo para las transacciones

export interface Transaction{
  id: number;
  inventoryId: number;
  transactionType: TransactionType; // Tipo de transacción (ingreso o egreso)
  quantity: number; // Cantidad de la transacción
  price?: number; // Precio, puede ser null
  transactionDate?: string; // Fecha de la transacción (será manejada por el backend)
}

export interface TransactionPost {
  transactionType: TransactionType; // Tipo de transacción (ingreso o egreso)
  quantity: number; // Cantidad de la transacción
  price?: number; // Precio, puede ser null
  transactionDate?: string; // Fecha de la transacción (será manejada por el backend)
}

export enum StatusType {
  ACTIVE = 'Active', // Activo
  INACTIVE = 'Inactive' // Inactivo
}

export enum TransactionType {
  ENTRY = 'ENTRY', // Ingreso de inventario
  OUTPUT = 'OUTPUT' // Egreso de inventario
}

// export interface Inventory {
//   id?: number;
//   article_id: number; // Relación con el ítem
//   stock: number;
//   min_stock?: number; // Puede ser null
//   inventory_status: StatusType; // Baja lógica
// }

export interface Inventory {
  id?: number;
  article: Article;     // Información del artículo
  stock: number;           // Cantidad en stock
  minStock: number;       // Stock mínimo
  location: string | null; // Ubicación del artículo, puede ser null
  status: StatusType;
  transactions: Transaction[]; // Lista de transacciones asociadas
}
