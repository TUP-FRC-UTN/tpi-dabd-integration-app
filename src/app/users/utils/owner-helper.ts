// metodos compartidos
export function mapOwnerType(type: string): string {
  switch (type) {
    case 'PERSON':
      return 'Persona';
    case 'COMPANY':
      return 'Compañía';
    case 'OTHER':
      return 'Otro';
    default:
      return 'Otro';
  }
}

export function mapDocType(type: string): string {
  switch (type) {
    case 'P':
      return 'DNI';
    case 'I':
      return 'Cédula';
    case 'T':
      return 'Pasaporte';
    default:
      return 'type';
  }
}

export function mapKycStatus(status: string): string {
  switch (status) {
    case 'INITIATED':
      return 'Iniciado';
    case 'TO_VALIDATE':
      return 'Para Validar';
    case 'VALIDATED':
      return 'Validado';
    default:
      return 'Iniciado';
  }
}

export function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

export function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}


