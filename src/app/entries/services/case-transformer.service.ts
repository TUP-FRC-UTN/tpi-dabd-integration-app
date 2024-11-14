import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CaseTransformerService {
  constructor() {}

  toSnakeCase<T = any>(obj: T | undefined): any {
    if (!obj) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((v) => this.toSnakeCase(v));
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).reduce((result: { [key: string]: any }, key) => {
        const value = (obj as any)[key];
        const newKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`
        );
        result[newKey] = this.toSnakeCase(value);
        return result;
      }, {});
    }

    return obj;
  }

  toCamelCase<T = any>(obj: T | undefined): any {
    if (!obj) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((v) => this.toCamelCase(v));
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).reduce((result: { [key: string]: any }, key) => {
        const value = (obj as any)[key];
        const newKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );
        result[newKey] = this.toCamelCase(value);
        return result;
      }, {});
    }

    return obj;
  }
}
