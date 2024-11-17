// environment.ts (desarrollo local)
export const environment = {
  production: true,
  apis: {
    // URLs directas a los servicios de cada grupo con su docker-compose
    accesses: 'http://localhost:8001/',
    accounts: 'http://localhost:8002/',
    addresses: 'http://localhost:8003/',
    cadastre: 'http://localhost:8004/',
    constructions: 'http://localhost:8005/',
    contacts: 'http://localhost:8006/',
    employees: 'http://localhost:8007/',
    expenses: 'http://localhost:8008/',
    inventory: 'http://localhost:8009/',
    moderations: 'http://localhost:8010/',
    notifications: 'http://localhost:8011/',
    payments: 'http://localhost:8012/',
    suppliers: 'http://localhost:8013/',
    tickets: 'http://localhost:8014/',
    users: 'http://localhost:8015/'
  }
};