import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { PlotService } from '../../../services/plot.service';
import { Plot, PlotStatusDictionary, PlotTypeDictionary } from '../../../models/plot';
import { ActivatedRoute, Router } from '@angular/router';
import { plotValidator } from '../../../validators/cadastre-plot-validators';
import { ToastService, MainContainerComponent } from 'ngx-dabd-grupo01';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-plot-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MainContainerComponent, NgClass],
  templateUrl: './plot-form.component.html',
  styleUrl: './plot-form.component.css'
})
export class PlotFormComponent {
  //#region SERVICIOS
  private plotService = inject(PlotService);
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)
  private toastService = inject(ToastService)
  //#endregion

  //#region ATT
  id: string | null = null;
  plot : any;  
  //#endregion
  
  //#region DICCIONARIOS
  plotTypeDictionary = PlotTypeDictionary;
  plotStatusDictionary = PlotStatusDictionary;
  //#endregion
  
  //#region FORMULARIO REACTIVO
  plotForm = new FormGroup({
    plotNumber:  new FormControl('', [Validators.required, Validators.min(1)], [plotValidator(this.plotService)]),
    blockNumber: new FormControl('', [Validators.required, Validators.min(1)]),
    totalArea: new FormControl('', [Validators.required, Validators.min(1)]),
    builtArea: new FormControl('', [Validators.required, Validators.min(1)]),
    plotType: new FormControl('', [Validators.required]),
    plotStatus: new FormControl('', [Validators.required])
  });
  //#endregion

  //#region USO DE DICCIONARIOS
  getKeys(dictionary: any) {
    return Object.keys(dictionary);
  }

  translateCombo(plotFormData: any, control: string, dictionary: any) {
    const value = this.plotForm.get(control)?.value;
    if (value !== undefined && value !== null) {
      return dictionary[value];
    }
    return;
  }

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
  //#endregion

  //#region ON SUBMIT
  onSubmit(): void {
    if (this.plotForm.valid) {
      if (this.id === null) {
        let plotFormData: any = {
          plot_number: this.plotForm.controls['plotNumber']?.value,
          block_number: this.plotForm.controls['blockNumber']?.value,
          built_area: this.plotForm.controls['builtArea']?.value,
          total_area: this.plotForm.controls['totalArea']?.value,
          plot_type: null,
          plot_status: null
        };
        plotFormData.plot_status = this.translateCombo(this.plotForm, 'plotStatus', this.plotStatusDictionary);
        plotFormData.plot_type = this.translateCombo(this.plotForm, 'plotType', this.plotTypeDictionary);
        this.plotService.createPlot(plotFormData, 1).subscribe(
          response => {
            console.log('Plot created successfully:', response);
            this.router.navigate(["/plot/list"])
            this.toastService.sendSuccess("Lote creado con exito.")
          },
          error => {
            console.error('Error creating plot:', error);
            this.toastService.sendError("Error creando el lote.")
          }
        );
      }
      else {
        let plotForUpdate: any = {
          total_area: this.plotForm.get('totalArea')?.value,
          built_area: this.plotForm.get('builtArea')?.value,
          plot_status: this.translateCombo(this.plotForm, 'plotStatus', this.plotStatusDictionary),
          plot_type: this.translateCombo(this.plotForm, 'plotType', this.plotTypeDictionary)
        }

        this.plotService.updatePlot(Number.parseInt(this.id), plotForUpdate, 1).subscribe(
          response => {
            console.log('Plot updated successfully:', response);
            this.toastService.sendSuccess("Lote actualizado con exito.")
            this.router.navigate(["/plot/list"])
          },
          error => {
            console.error('Error creating plot:', error);
            this.toastService.sendError("Error actualizando el lote.")
          }
        );
      }
    }
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id !== null) {
      this.setEditValues();
    }
  }
  //#endregion

  //#region SETEAR VALORES AL FORM
  setEditValues() {
    if(this.id) {
      this.plotForm.controls['plotNumber'].disable();
      this.plotForm.controls['blockNumber'].disable();
      this.plot = this.plotService.getPlotById(parseInt(this.id)).subscribe(
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

  //#region RUTEO | CANCELAR
  cancel() {
    this.router.navigate(["/plot/list"])
  }
  //#endregion
}
