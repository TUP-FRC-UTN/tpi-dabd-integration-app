export interface Visitor {
  visitor_id: number;
  owner_id: number;
  name: string;
  last_name: string;
  doc_number: string;
  birth_date: any;
  is_active: boolean;
}

export interface SendVisitor {
  name: string;
  last_name: string;
  doc_number: string;
  birth_date: any;
  is_active: boolean;
}
