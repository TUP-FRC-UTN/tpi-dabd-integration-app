export interface ContactAudit {
  auditId: number;
  contactId: number;
  revisionDate: string;
  revisionId: number;
  revisionType: string;
  value: string;
  contactType: string;
}

export interface ContactAuditResponse {
  audit_id: number;
  contact_id: number;
  value: string;
  contact_type: ContactType;
  revision_id: number;
  revision_type: string;
  revision_date: string;
}

export enum ContactType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SOCIAL_MEDIA_LINK = 'SOCIAL_MEDIA_LINK'
}



