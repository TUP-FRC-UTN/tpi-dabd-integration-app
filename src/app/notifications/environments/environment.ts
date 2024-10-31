declare global {
  interface Window {
    env: {
      CONTACTS_API_URL: string;
      NOTIFICATIONS_API_URL: string;
    }
  }
}

const getWindow = (): any => {
  if (typeof window !== 'undefined') {
    return window;
  }
  return {
    env: {
      CONTACTS_API_URL: 'http://localhost:8006',
      NOTIFICATIONS_API_URL: 'http://localhost:8011'
    }
  };
};

export const environment = {
  production: false,
  apis: {
    contacts: {
      url: getWindow().env?.CONTACTS_API_URL || 'http://localhost:8006'
    },
    notifications: {
      url: getWindow().env?.NOTIFICATIONS_API_URL || 'http://localhost:8011'
    }
  }
};

