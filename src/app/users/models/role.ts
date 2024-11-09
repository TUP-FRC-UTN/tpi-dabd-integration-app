/**
 * Represents a role with details such as code, name, and description, as well as its active status.
 */
export interface Role {
  /** Unique identifier of the role */
  id: number;
  /** Numeric code associated with the role */
  code: number;
  /** Technical name of the role */
  name: string;
  /** Display-friendly name of the role */
  prettyName: string;
  /** Description of the role’s responsibilities or purpose */
  description: string;
  /** Indicates if the role is currently active */
  active: boolean;
}

/**
 * Constante `URLTargetType` que define una lista de códigos de acceso a diferentes áreas y roles dentro de la aplicación.
 * 
 * Esta constante organiza los identificadores únicos que representan permisos de acceso y funcionalidades 
 * específicas en distintas secciones de la aplicación, como gestión de usuarios, administración, 
 * operaciones de POS, y más. Los códigos aquí definidos se usan para validar el acceso a funcionalidades 
 * específicas según el rol del usuario.
 * 
 * <ul>
 *   <li><b>SUPERADMIN</b>: Código 999, acceso total al sistema.</li>
 *   <li><b>USER MANAGEMENT</b>: Incluye roles como `USER_ADMIN` y `KYC_ADMIN` con permisos de gestión de usuarios.</li>
 *   <li><b>INVENTORY MANAGEMENT</b>: Permisos relacionados con la administración de inventarios.</li>
 *   <li><b>EMPLOYEE MANAGEMENT</b>: Roles de gestión de empleados, administración financiera y seguridad.</li>
 *   <li><b>NOTIFICATIONS</b>: Permisos para la administración de notificaciones.</li>
 *   <li><b>PAYMENTS</b>: Permisos para la administración de pagos.</li>
 *   <li><b>FINES AND PENALTIES</b>: Acceso a la gestión de multas y sanciones.</li>
 *   <li><b>CONSTRUCTION PROJECTS</b>: Permisos para la administración de proyectos de construcción.</li>
 *   <li><b>EXPENSES MANAGEMENT</b>: Gestión de gastos y expensas comunales.</li>
 *   <li><b>POS AND OPERATIONS</b>: Incluye acceso a operaciones de POS, cajas, quioscos, y otras operaciones relacionadas.</li>
 *   <li><b>COMMERCIAL</b>: Acceso a oficinas de tickets, esquemas de tarifas, grupos de afinidad y tipos de pago.</li>
 *   <li><b>TRAFFIC</b>: Acceso a rutas, inventario de tráfico, paradas, y gestión de vehículos.</li>
 *   <li><b>ADMINISTRATION</b>: Incluye roles de administración general y gestión de conceptos operativos.</li>
 *   <li><b>REPORTS</b>: Acceso a dashboards e informes de tráfico.</li>
 *   <li><b>TOOLS</b>: Acceso a herramientas de configuración, dispositivos, plantillas de impresión y ventas en línea.</li>
 * </ul>
 */
export const URLTargetType = {
  //----SUPERADMIN----
  SUPERADMIN: 999,

  //----USER MANAGEMENT----
  USER_ADMIN: 100,
  KYC_ADMIN: 101,
  OWNER: 102,
  TENANT: 103,

  //----INVENTORY MANAGEMENT----
  INVENTORY_ADMIN: 200,
  MAINTENANCE: 201,

  //----EMPLOYEE MANAGEMENT----
  EMPLOYEE_ADMIN: 300,
  ADMINISTRATIVE: 301,
  FINANCE: 302,
  FINANCE_ASSISTANT: 303,
  SECURITY_GUARD: 304,
  GENERIC_EMPLOYEE: 305,

  //----NOTIFICATIONS----
  NOTIFICATIONS_ADMIN: 400,

  //----PAYMENTS----
  PAYMENTS_ADMIN: 500,

  //----FINES AND PENALTIES----
  FINES_ADMIN: 600,

  //----CONSTRUCTION PROJECTS----
  CONSTRUCTION_ADMIN: 700,

  //----EXPENSES MANAGEMENT----
  EXPENSES_ADMIN: 800,

  //----POS AND OPERATIONS----
  POS: 9999100,
  CASHBOX: 9999101,
  TICKET_OPERATIONS: 9999102,
  KIOSK: 9999103,

  //----COMMERCIAL----
  OLD_TICKET_OFFICES: 9999302, // TODO: remove on v1.4
  TICKET_OFFICES: 9999501,
  TARIFF_SCHEMES: 9999502,
  AFFINITY_GROUPS: 9999503,
  PAYMENT_TYPE: 9999504,

  //----TRAFFIC----
  ROUTES_AND_INVENTORY: 9999201,
  TRIPS_AND_BOARDING: 9999202,
  STOPS: 9999203,
  VEHICLES: 9999204,

  //----ADMINISTRATION----
  USER: 9999301,
  CREWSMANAGER: 9999303,
  OPERATION_CONCEPTS: 9999305,

  //----REPORTS----
  OLD_DASHBOARD: 9999300, // TODO: remove on v1.4
  DASHBOARD: 9999600,
  ROADMAPS: 9999601,

  //----TOOLS----
  CONFIGURATION: 9999400,
  DEVICES: 9999401,
  PRINTING_TEMPLATES: 9999402,
  ONLINE_SALES_SETTINGS: 9999403
};

