export interface NotificationFilter {
    id?: number;
    recipient?: string;
    viewed?: boolean;
    subject?: string;
    from?: string;
    until?: string;
    contact_id?: number;
    search_term?: string;
  }
  