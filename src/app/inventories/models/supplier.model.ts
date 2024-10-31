import { ServiceType } from "./enums/service-tpye.enum";// ELIMINAR ESTOS MODELOS!
import { StatusType } from "./enums/status-type.enum"; // ELIMINAR ESTOS MODELOS!

// Definimos la interfaz Supplier para representar un proveedor en el sistema.
export interface Supplier {
  id: number;             // Identificador único del proveedor
  name: string;           // Nombre del proveedor
  cuil: string;           // CUIL del proveedor
  service: string;        // Servicio que ofrece el proveedor
  contact: string;        // Contacto del proveedor
  address: string;        // Dirección del proveedor
  details?: string;       // Detalles adicionales sobre el proveedor (opcional)
  enabled: boolean;       // Si está activo o no
}
