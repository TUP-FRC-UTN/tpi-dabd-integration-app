export enum StatusType {
  ACTIVE = 'IN_SERVICE', // Activo
  INACTIVE = 'DOWN' // Inactivo
}

export enum EmployeeType {
  ADMIN = 'ADMIN', // Administrador
  SECURITY = 'SECURITY'
}

export enum DocumentType {
  DNI = 'DNI', // Documento Nacional de Identidad
  PASSPORT = 'PASSPORT', // Pasaporte
  CUIT = 'CUIT',
  CUIL= 'CUIL'
}

export enum ShiftType {
  DAY = 'DAY', // Turno de día
  NIGHT = 'NIGHT' // Turno de noche
}

export interface ShiftSchedule {
  entryTime: string; // Hora de entrada
  exitTime: string;  // Hora de salida
}

export interface EmployeeShifts {
  shifts: string[]; // Turnos asignados al empleado
  shiftType: ShiftType; // Tipo de turno (día, noche)
}

// Definimos la interfaz Employee para representar un empleado en el sistema.
export interface Employee {
  id: number; // Identificador único del empleado.
  firstName: string; // Primer nombre del empleado.
  lastName: string; // Apellido del empleado.
  employeeType: EmployeeType; // Tipo de empleado (ej. Admin, Técnico, etc.).
  documentType: DocumentType; // Tipo de documento (DNI, Pasaporte, etc.).
  docNumber: string; // Número del documento del empleado.
  hiringDate: string; // Fecha de contratación del empleado.
  salary: number; // Salario del empleado.
  state: StatusType; // Estado del empleado (Activo o Inactivo).
}

export interface EmployeePayment {
  id: number;
  employeeId: number;
  paymentDate: string; // Fecha de pago
  paymentAmount: number; // Monto de pago
  paymentDetail: string; // Detalle del pago
}
export interface EmployeeFilter {
  firstName?: string;
  lastName?: string;
  employeeType?: EmployeeType;
  docType?: DocumentType;
  docNumber?: string;
  hiringDate?: Date;
  salary?: number;
  state?: StatusType;
  enabled?: boolean;
}