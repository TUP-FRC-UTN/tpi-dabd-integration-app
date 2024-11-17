import { inject, Injectable } from '@angular/core';
import { Owner } from '../../../users/models/owner';
import { CaseTransformerService } from '../case-transformer.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';
import { map } from 'rxjs';

export interface ownerPlotResponse{
  plot_id: number;
  owner: Owner;
}

@Injectable({
  providedIn: 'root'
})
export class PlotsByOwnerService {

  constructor(private http: HttpClient) { }

  caseTransformer = inject(CaseTransformerService)

  host: string = `${environment.production ? `${environment.apis.cadastre}` : `${environment.apis.cadastre}`}`;
  
  actualOwnerByPlot(plotId : number){
    return this.http.get<ownerPlotResponse>(`${this.host}owner/current/plot/${plotId}`).pipe(
      map((response) =>{
        return this.caseTransformer.toCamelCase(response)
      })
    );
  }

}
