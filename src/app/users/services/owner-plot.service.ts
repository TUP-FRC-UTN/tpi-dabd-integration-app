import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Owner } from '../models/owner';
import { PaginatedResponse } from '../models/api-response';
import { Plot } from '../models/plot';
import { map } from 'rxjs';
import { TransformPlotPipe } from '../pipes/plot-mapper.pipe';
import { TransformOwnerPlotHistoryPipe } from '../pipes/owner-history-plots-mapper.pipe';
import { OwnerPlotHistoryDTO } from '../models/ownerXplot';
import { environment } from '../../../environments/environment';
import { CaseTransformerService } from '../../entries/services/case-transformer.service';


export interface ownerPlotResponse{
  plot_id: number;
  owner: Owner;
}

@Injectable({
  providedIn: 'root'
})
export class OwnerPlotService {
  constructor(private http: HttpClient) { }

  caseTransformer = inject(CaseTransformerService)

  host: string = `${environment.production ? `${environment.apis.cadastre}` : `${environment.apis.cadastre}`}`;
  giveActualOwner(plotId : number) {
    return this.http.get<Owner>(`${this.host}/owner/current/plot/${plotId}`);
  }

  actualOwnerByPlot(plotId : number){
    return this.http.get<ownerPlotResponse>(`${this.host}/owner/current/plot/${plotId}`).pipe(
      map((response) =>{
        return this.caseTransformer.toCamelCase(response)
      })
    );
  }

  giveAllOwnersByPlot(plotId: number | string, page: number, size: number) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<OwnerPlotHistoryDTO>>(`${this.host}/owner/plot/${plotId}`, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new TransformOwnerPlotHistoryPipe();
        const transformedOwners = response.content.map((owner: any) => transformPipe.transform(owner));
        return {

          ...response,
          content: transformedOwners
        };
      })
    );
  }

  giveAllPlotsByOwner(ownerId: number | string, page : number, size : number) {
    const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

    return this.http.get<PaginatedResponse<Plot>>(`${this.host}/plot/owner/${ownerId}`, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new TransformPlotPipe();
        const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
        return {
          ...response,
          content: transformedPlots
        };
      })
    );
  }

  removePlot(plotId : number, ownerId : number) {
    //TODO: Rehacer el back para que acepte esta llamada
    return this.http.delete<any>(`${this.host}/remove/owner/${ownerId}/plot/${plotId}`);
  }
}
