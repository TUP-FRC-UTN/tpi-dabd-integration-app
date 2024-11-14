/**
 * DTO for representing payment details.
 */
export interface PaymentReportDto {
    /**
     * Unique identifier of the payment.
     */
    id: number;

    /**
     * Amount of the payment. Must be a positive value and cannot be null.
     */
    amount: number;

    /**
     * Payment method used. Examples: "Transfer", "Cash", "Mercado Pago".
     */
    paymentMethod: string;

    /**
     * Date and time when the payment was created.
     */
    createdAt: Date;

    /**
     * Identifier of the associated ticket.
     */
    ticketId: number;

    /**
     * Identifier of the owner associated with the payment. Cannot be null.
     */
    adminNameWhoApproves: string;

    /**
     * URL to the payment receipt in MinIO.
     */
    receiptUrl: string;

    /**
     * Status of the payment. Values: "pendiente", "aprobado", "rechazado".
     */
    status: 'REJECTED' | 'APPROVED' | 'PENDING';

    /**
     * Period of the payment.
     */
    period: string;
  }


export enum PayMethod {
  TRANSFERENCE = "TRANSFERENCE",
  MERCADO_PAGO = "MERCADO PAGO"
}
