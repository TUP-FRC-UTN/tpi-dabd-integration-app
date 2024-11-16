export interface User {
    value:          Person;
    expirationTime: number;
}

export interface Person {
    id:              number;
    first_name:      string;
    last_name:       string;
    user_name:       string;
    email:           string;
    is_active:       boolean;
    owner_id:        number;
    plot_id:         number;
    addresses:       null;
    contacts:        null;
    roles:           Role[];
    created_date:    string;
    document_number: string;
    document_type:   string;
    birthdate:       string;
}

export interface Role {
    id:          number;
    code:        number;
    name:        string;
    description: string;
    pretty_name: string;
    is_active:   boolean;
}
