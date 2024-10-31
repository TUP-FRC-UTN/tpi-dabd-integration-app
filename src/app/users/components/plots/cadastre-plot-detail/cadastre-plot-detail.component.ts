import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { PlotService } from '../../../services/plot.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Plot, PlotStatusDictionary, PlotTypeDictionary } from '../../../models/plot';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MainContainerComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-cadastre-plot-detail',
  standalone: true,
  imports: [ReactiveFormsModule, MainContainerComponent],
  templateUrl: './cadastre-plot-detail.component.html',
  styleUrl: './cadastre-plot-detail.component.css'
})
export class CadastrePlotDetailComponent {
  //#region SERVICIOS
  private plotService = inject(PlotService);
  private activatedRoute = inject(ActivatedRoute)
  private location = inject(Location)
  //#endregion

  plot: any

  //#region DICCIONARIOS
  plotTypeDictionary = PlotTypeDictionary;
  plotStatusDictionary = PlotStatusDictionary;
  //#endregion

  //#region FORM REACTIVO
  plotForm = new FormGroup({
    plotNumber: new FormControl(''),
    blockNumber: new FormControl(''),
    totalArea: new FormControl(''),
    builtArea: new FormControl(''),
    plotType: new FormControl(''),
    plotStatus: new FormControl('')
  });
  //#endregion

  ngOnInit(): void {
    this.setValues(this.activatedRoute.snapshot.paramMap.get('id'));
  }

  //#region USO DE DICCIONARIOS
  translateValueEngSpa(value: any, dictionary: { [key: string]: any }) {
    if (value !== undefined && value !== null) {
      for (const key in dictionary) {
        if (dictionary[key] === value) {
          return key;
        }
      }
    }
    console.log("Algo salio mal.");
    return;
  }

  getKeys(dictionary: any) {
    return Object.keys(dictionary);
  }
  //#endregion

  //#region SETEO DE VALORES AL FORM
  setValues(plotId : string | null) {
    if(plotId) {
      this.plotForm.controls['plotNumber'].disable();
      this.plotForm.controls['blockNumber'].disable();
      this.plotForm.controls['totalArea'].disable();
      this.plotForm.controls['builtArea'].disable();
      this.plotForm.controls['plotType'].disable();
      this.plotForm.controls['plotStatus'].disable();
      this.plot = this.plotService.getPlotById(parseInt(plotId)).subscribe(
        response => {

          this.plot = response;
          this.plotForm.patchValue({
            plotNumber: response.plotNumber,
            blockNumber: response.blockNumber,
            builtArea: response.builtArea,
            totalArea: response.totalArea,
            plotType: this.translateValueEngSpa(response.plotType, this.plotTypeDictionary),
            plotStatus: this.translateValueEngSpa(response.plotStatus, this.plotStatusDictionary)
          })
        },
        error => {
          console.error("Error al obtener plot: ", error);
        }
      );
    }
  }
  //#endregion

  goBack() {
    this.location.back()
  }
}
