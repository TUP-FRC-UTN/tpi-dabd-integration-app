import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { map, switchMap, timer, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlotService } from "../services/plot.service";
import {Plot} from '../models/plot';
import {OwnerPlotService} from '../services/owner-plot.service';
import {Owner} from '../models/owner';

export const plotForOwnerValidatorNoAssociation = (plotService: PlotService, ownerPlotService: OwnerPlotService): AsyncValidatorFn => {
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
        plotService.getPlotByPlotNumberAndBlockNumber(plotNumber, blockNumber).pipe(
          switchMap((plot: Plot) =>
            ownerPlotService.giveActualOwner(plot.id).pipe(
              map(() => ({ plotHaveOwner: true })),
              catchError((error) => {
                if (error.status === 404) {
                  return of(null);
                }
                return of({ serverError: true });
              })
            )
          ),
          catchError((error) => {
            if (error.status === 404) {
              return of({ plotNotExists: true });
            }
            return of({ serverError: true });
          })
        )
      )
    );
  };
};
