import { inject, Injectable } from '@angular/core';
import { Authorizer } from '../models/authorization/authorize.model';
import { HttpClient } from '@angular/common/http';
import { OwnerPlotService } from '../../users/services/owner-plot.service';
import { PlotService } from '../../users/services/plot.service';
import { Plot } from '../../users/models/plot';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Contact } from '../../users/models/owner';
import { PaginatedResponse } from '../../users/models/api-response';

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

    // obtencion de owner y plots

private plotService = inject(PlotService);
private ownerPlotService = inject(OwnerPlotService);

getPlotsWithOwnerInfo(page: number, size: number): Observable<PaginatedResponse<PlotOwnerInfo>> {
  debugger
  return this.plotService.getAllPlots(page, size).pipe(
    switchMap((plotsResponse: PaginatedResponse<Plot>) => {
      // Crear un array de observables para obtener los datos del propietario de cada plot
      const ownerRequests = plotsResponse.content.map(plot => 
        this.ownerPlotService.giveActualOwner(plot.id).pipe(
          map(owner => ({
            plotId: plot.id,
            plotData: plot,
            ownerName: `${owner.firstName} ${owner.lastName}`,
            ownerContact: this.getMainContact(owner.contacts)
          }))
        )
      );

      // Combinar todos los resultados
      return forkJoin(ownerRequests).pipe(
        map(combinedData => ({
          content: combinedData,
          totalElements: plotsResponse.totalElements,
          totalPages: plotsResponse.totalPages,
          size: plotsResponse.size,
          number: plotsResponse.number,
          first: plotsResponse.number === 0,
          last: plotsResponse.number === plotsResponse.totalPages - 1
        } as PaginatedResponse<PlotOwnerInfo>))
      );
    })
  );
}

private getMainContact(contacts: Contact[] | Contact | null): string {
  if (!contacts) return 'Sin contacto';
  
  if (Array.isArray(contacts)) {
    // Buscar primero un email
    const emailContact = contacts.find(contact => 
      contact?.contactType?.toLowerCase() === 'email');
    if (emailContact) return emailContact.contactValue || emailContact.value || 'Sin contacto';

    // Si no hay email, devolver el primer contacto disponible
    return contacts[0]?.contactValue || contacts[0]?.value || 'Sin contacto';
  } else if (contacts) {
    // Si es un único contacto
    return contacts.contactValue || contacts.value || 'Sin contacto';
  }
  return 'Sin contacto';
}

}

interface PlotOwnerInfo {
  plotId: number;
  plotData: Plot;
  ownerName: string;
  ownerContact: string;
}

