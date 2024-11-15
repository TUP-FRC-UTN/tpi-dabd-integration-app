import { Injectable } from '@angular/core';
import { Authorizer } from '../models/authorization/authorize.model';

@Injectable({
  providedIn: 'root',
})
export class AuthorizerCompleterService {
  authorizers: Authorizer[] = [
    {
      authId: 1,
      authFirstName: 'Ana',
      authLastName: 'García',
      docType: 'DNI',
      docNumber: 12345678,
    },
    {
      authId: 2,
      authFirstName: 'Javier',
      authLastName: 'Pérez',
      docType: 'CUIL',
      docNumber: 23456789,
    },
    {
      authId: 3,
      authFirstName: 'Sofía',
      authLastName: 'Rodríguez',
      docType: 'DNI',
      docNumber: 34567890,
    },
    {
      authId: 4,
      authFirstName: 'Diego',
      authLastName: 'Martínez',
      docType: 'CUIT',
      docNumber: 45678901,
    },
    {
      authId: 5,
      authFirstName: 'Lucía',
      authLastName: 'Fernández',
      docType: 'PASSPORT',
      docNumber: 56789012,
    },
    {
      authId: 6,
      authFirstName: 'Mateo',
      authLastName: 'López',
      docType: 'DNI',
      docNumber: 67890123,
    },
    {
      authId: 7,
      authFirstName: 'Valentina',
      authLastName: 'Gómez',
      docType: 'CUIT',
      docNumber: 78901234,
    },
    {
      authId: 8,
      authFirstName: 'Samuel',
      authLastName: 'Díaz',
      docType: 'DNI',
      docNumber: 89012345,
    },
    {
      authId: 9,
      authFirstName: 'Mariana',
      authLastName: 'Hernández',
      docType: 'PASSPORT',
      docNumber: 90123456,
    },
    {
      authId: 10,
      authFirstName: 'Fernando',
      authLastName: 'Torres',
      docType: 'CUIL',
      docNumber: 10234567,
    },
  ];

  completeAuthorizer(id: number): Authorizer {
    return this.authorizers.find((x) => x.authId == id)!;
  }
}
