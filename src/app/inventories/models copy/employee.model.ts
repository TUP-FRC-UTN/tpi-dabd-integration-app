export enum StatusType {
  ACTIVE = 'IN_SERVICE', // Activo
  INACTIVE = 'DOWN' // Inactivo
}

export enum EmployeeType {
  ADMINISTRATIVO = 'ADMINISTRATIVO', // Administrador
  GUARDIA = 'GUARDIA',
  CONTADOR = 'CONTADOR',
  MANTENIMIENTO = 'MANTENIMIENTO'
}

export enum DocumentType {
  DNI = 'DNI', // Documento Nacional de Identidad
  PASSPORT = 'PASSPORT', // Pasaporte
  CUIT = 'CUIT',
  CUIL= 'CUIL'
}

//Horarios By Nico 💋

export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT'
}


export interface DaySchedule {
  entry_time: string;
  exit_time: string;
}

export interface EmployeeSchedule {
  employee_id: number;
  start_date: string;
  finish_date: string;
  shift_type: ShiftType;
  day_schedules: {
    [key: string]: DaySchedule;
  };
}
// HASTA ACA 💋

export interface ShiftSchedule {
  entryTime: string; // Hora de entrada
  exitTime: string;  // Hora de salida
}

export interface EmployeeShifts {
  shifts: string[]; // Turnos asignados al empleado
  shiftType: ShiftType; // Tipo de turno (día, noche)
}

export interface Address {
  street_address: string;
  number: number;
  floor: number;
  apartment: string;
  city: string;
  province: string;
  country: string;
  postal_code: number;
}

// Definimos la interfaz Employee para representar un empleado en el sistema.
export interface Employee {
  id: number; // Identificador único del empleado.
  firstName: string; // Primer nombre del empleado.
  lastName: string; // Apellido del empleado.
  employeeType: EmployeeType; // Tipo de empleado (ej. Admin, Técnico, etc.).
  documentType: DocumentType; // Tipo de documento (DNI, Pasaporte, etc.).
  docNumber: string; // Número del documento del empleado.
  hiringDate: Date; // Fecha de contratación del empleado.
  //hiringDate: Date;
  salary: number; // Salario del empleado.
  state: StatusType; // Estado del empleado (Activo o Inactivo).
  address?: Address; // Dirección del empleado.
  contactValue: string,
  contactType: ContactType;
  contact: Contact;
  //enabled: boolean; // Estado del empleado (Activo o Inactivo).
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

//Access interface

// Enum para los tipos de contacto
export enum ContactType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  // Añade otros tipos según necesites
}

// Interface para el contacto
export interface Contact {
  contactValue: string;
  contactType: ContactType;
}

// Interface para los días de la semana
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

// Interface para el rango de autorización
export interface AuthRange {
  date_from: string;  // formato: "DD-MM-YYYY"
  date_to: string;    // formato: "DD-MM-YYYY"
  hour_from: string;  // formato: "HH:mm:ss"
  hour_to: string;    // formato: "HH:mm:ss"
  days_of_week: DayOfWeek[];
  comment: string;
}

// Interface para la solicitud de rango de autorización
export interface AuthRangeRequest {
  auth_range_request: AuthRange[];
}

// Interface para el formulario (opcional, pero útil para tipado fuerte en el componente)
export interface AccessFormData {
  dateFrom: string;
  dateTo: string;
  hourFrom: string;
  hourTo: string;
  daysOfWeek: DayOfWeek[];
  comment?: string;
}