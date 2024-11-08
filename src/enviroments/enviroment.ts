// environment.ts
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/',
    
    // Prefijos de API según el nginx del backend
    apiPrefixes: {
      accesses: 'accesses/',
      accounts: 'accounts/',
      addresses: 'addresses/',
      cadastre: 'cadastre/',
      expenses: 'expenses/',
      moderations: 'moderations/',
      notifications: 'notifications/',
      constructions: 'constructions/',
      contacts: 'contacts/',
      tickets: 'tickets/',
      payments: 'payments/',
      employees: 'employees/',
      inventory: 'inventory/',
      suppliers: 'suppliers/',
      users: 'users/'
    }
  };
  
  