import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { PlotService } from '../../../services/plot.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Plot, PlotStatusDictionary, PlotTypeDictionary } from '../../../models/plot';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { InfoComponent } from '../../commons/info/info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  private modalService = inject(NgbModal)
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

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });  
    
    modalRef.componentInstance.title = 'Detalles de Lotes';
    modalRef.componentInstance.description = 'Esta pantalla permite visualizar los datos detallados de los lotes.';
    modalRef.componentInstance.body = [
      { 
        title: 'Datos', 
        content: [
          {
            strong: 'Número de Manzana:',
            detail: 'Número de manzana del lote.'
          },
          {
            strong: 'Número de Lote:',
            detail: 'Número del lote.'
          },
          {
            strong: 'Área Total:',
            detail: 'Superficie total del lote. (En metros cuadrados)'
          },
          {
            strong: 'Área Construida:',
            detail: 'Superficie construida dentro del lote. (En metros cuadrados)'
          },
          {
            strong: 'Tipo de Lote:',
            detail: 'Tipo del lote.'
          },
          {
            strong: 'Estado del Lote:',
            detail: 'Estado actual del lote.'
          }
        ]
      }
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una gestión eficiente y segura de la información de los lotes, manteniendo la integridad y precisión de los datos.'
    ];
    
  }
}
