// Definición de la interfaz para representar el ticket
export interface TicketReportDto {
  /** Identifier for the ticket */
  id: number;

  /** Period of the ticket */
  period: string;

  /** Number of the ticket */
  ticketNumber: string;

  /** Owner of the ticket */
  owner: OwnerTicketDto;

  /** Identifier of the plot associated with the ticket */
  lotId: number;

  /** Issue date of the ticket in YYYY-MM-DD format */
  issueDate: string; // Date as a string in ISO format (YYYY-MM-DD)

  /** Expiration date of the ticket in YYYY-MM-DD format */
  expirationDate: string; // Date as a string in ISO format (YYYY-MM-DD)

  /** Status of the ticket */
  status: TicketStatus;

  /** Total amount of the ticket */
  totalAmount: number;

  /** List of ticket details */
  ticketDetails: TicketDetailDto[];

  /** URL of the ticket */
  urlTicket: string;
}

// Interfaz para OwnerTicketDto, TicketStatus y TicketDetailDto
interface OwnerTicketDto {
  id: number;             // Unique identifier for the owner
  firstName: string;      // First name of the owner
  secondName: string;     // Second name of the owner (optional in some cases)
  lastName: string;       // Last name of the owner
  ownerType: string;      // Type of the owner (e.g., individual, organization)
  documentNumber: string; // Document number of the owner
  documentType: string;   // Type of the document (e.g., DNI, Passport)
  cuit: string;           // CUIT (tax identification number) of the owner
  // contacts: ContactClient[]; // List of contacts associated with the owner
}

enum TicketStatus {
  PENDING = 'PENDING',          // Status indicating that the ticket is pending
  PAID = 'PAID',                // Status indicating that the ticket has been paid
  CANCELED = 'CANCELED',        // Status indicating that the ticket has been canceled
  UNDER_REVIEW = 'UNDER_REVIEW',// Status indicating that the ticket is under review
  EXPIRED = 'EXPIRED',          // Status indicating that the ticket has expired
  IN_DEFAULT = 'IN_DEFAULT'     // Status indicating that the ticket is in default
}

interface TicketDetailDto {
  id: number;          // Unique identifier for the ticket detail
  description: string; // Description of the ticket item
  amount: number;      // Price of the ticket item
}

