import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { map, switchMap, timer, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlotService } from "../services/plot.service";

export const plotForOwnerValidator = (service: PlotService): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.parent) {
      return of(null);
    }

    const plotNumber = control.parent.get('plotNumber')?.value;
    const blockNumber = control.parent.get('blockNumber')?.value;

    if (!plotNumber || !blockNumber) {
      return of(null);
    }

    return timer(1000).pipe(
      switchMap(() =>
        service.getPlotByPlotNumberAndBlockNumber(plotNumber, blockNumber).pipe(
          map(() => {
            // Si el plot existe, devuelve null para indicar que no hay error
            return null; // No hay error si el plot existe
          }),
          catchError((error) => {
            // Si el error es 404, significa que el plot no existe
            if (error.status === 404) {
              return of({ plotExists: true }); // Hay un error si el plot no existe
            }
            return of({ serverError: true }); // Maneja otros errores
          })
        )
      )
    );
  };
};
