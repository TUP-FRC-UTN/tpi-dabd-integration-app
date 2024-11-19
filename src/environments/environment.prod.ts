
// environment.prod.ts producción con nginx segun backend 
const API_URL = 'https://lbsm4xgt-8080.brs.devtunnels.ms/';

export const environment = {
  production: true,
  apis: {
    // URLs a través del nginx reverse proxy según backend
    accesses: `${API_URL}accesses/`,
    accounts: `${API_URL}accounts/`,
    addresses: `${API_URL}addresses/`,
    cadastre: `${API_URL}cadastre/`,
    constructions: `${API_URL}constructions/`,
    contacts: `${API_URL}contacts/`,
    employees: `${API_URL}employees/`,
    expenses: `${API_URL}expenses/`,
    inventory: `${API_URL}inventory/`,
    moderations: `${API_URL}moderations/`,
    notifications: `${API_URL}notifications/`,
    payments: `${API_URL}payments/`,
    suppliers: `${API_URL}suppliers/`,
    tickets: `${API_URL}tickets/`,
    users: `${API_URL}users/`
  }
};