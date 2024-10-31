import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MapperService {
  constructor() {}

  // Convierte un objeto de camelCase a snake_case
  toSnakeCase(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Retorna el valor si no es un objeto
    }

    if (Array.isArray(obj)) {
      return obj.map(this.toSnakeCase.bind(this)); // Mapea sobre cada elemento si es un array
    }

    return Object.keys(obj).reduce((acc, key) => {
      // Convierte la clave a snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeKey] = this.toSnakeCase(obj[key]); // Llama recursivamente para los valores
      return acc;
    }, {} as any); // Asegura que acc es un objeto
  }

  // Convierte un objeto de snake_case a camelCase
  toCamelCase(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Retorna el valor si no es un objeto
    }

    if (Array.isArray(obj)) {
      return obj.map(this.toCamelCase.bind(this)); // Mapea sobre cada elemento si es un array
    }

    return Object.keys(obj).reduce((acc, key) => {
      // Convierte la clave a camelCase
      const camelKey = key.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());
      acc[camelKey] = this.toCamelCase(obj[key]); // Llama recursivamente para los valores
      return acc;
    }, {} as any); // Asegura que acc es un objeto
  }
}
