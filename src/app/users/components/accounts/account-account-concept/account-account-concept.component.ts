import { Component, inject } from '@angular/core';
import { AccountService } from '../../../services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountingConcept, ConceptTypes } from '../../../models/account';
import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { PlotService } from '../../../services/plot.service';
import { Plot } from '../../../models/plot';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { InfoComponent } from '../../commons/info/info.component';

@Component({
  selector: 'app-account-account-concept',
  standalone: true,
  imports: [CommonModule, MainContainerComponent, CurrencyPipe, NgbPagination, FormsModule],
  templateUrl: './account-account-concept.component.html',
  styleUrl: './account-account-concept.component.css'
})
export class AccountAccountConceptComponent {
  private accountService = inject(AccountService);
  private plotService = inject(PlotService)
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)
  private modalService = inject(NgbModal)

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
  conceptList: AccountingConcept[] = [];
  lastPage: boolean | undefined
  totalItems: number = 0;
  //#endregion

  plotId!: number;
  plot!: Plot;
  conceptTypesDictionary = ConceptTypes;

  ngOnInit() {
    this.plotId = Number(this.activatedRoute.snapshot.paramMap.get('plotId'));
    this.getPlot(this.plotId);
    this.getAllConcepts(this.plotId);
  }

  getPlot(plotId: number){
    this.plotService.getPlotById(plotId).subscribe(
      response => {
        this.plot = response as Plot
      },
      error => {
        console.error('Error getting plot:', error);
      }
    )
  }

  getAllConcepts(plotId: number) {
    this.accountService.getConceptsByPlotId(plotId, this.currentPage-1, this.pageSize).subscribe(
      response => {
        this.conceptList = response.content;
        this.lastPage = response.last;
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting concepts:', error);
      }
    )
  }

  changePage(forward: boolean) {
    forward ? this.currentPage++ : this.currentPage--
  }

  goBack() {
    this.router.navigate(['/users/plot/list']);
  }

  formatDate(arr: number[]) {
    let date = new Date();
    date.setFullYear(arr[0]);
    date.setMonth(arr[1]);
    date.setDate(arr[2]);
    date.setHours(arr[3]);
    date.setMinutes(arr[4]);

    return date;
  }

  translateTable(value: any, dictionary: { [key: string]: any }) {
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

  //#region FUNCIONES PARA PAGINADO
  onItemsPerPageChange() {
    this.currentPage = 1;
    this.getAllConcepts(this.plotId);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllConcepts(this.plotId);
  }
  //#endregion

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    }); 
    
    
    modalRef.componentInstance.title = 'Lista de Gastos';
    modalRef.componentInstance.description = 'Esta pantalla permite la visualización de todos los gastos asociados al lote.';
    modalRef.componentInstance.body = [
      { 
        title: 'Datos', 
        content: [
          {
            strong: 'Fecha:',
            detail: 'Fecha en la que se registró el gasto.'
          },
          {
            strong: 'Tipo de Gasto:',
            detail: 'Clasificación del gasto (Pago, Expensa Común, Expensa Extraordinaria).'
          },
          {
            strong: 'Comentarios:',
            detail: 'Descripción breve o comentario asociado al gasto.'
          },
          {
            strong: 'Balance:',
            detail: 'Monto del gasto, mostrando valores negativos en rojo y valores positivos en verde.'
          }
        ]
      },
      {
        title: 'Acciones',
        content: [
          {
            strong: 'Volver: ',
            detail: 'Botón para volver hacia la vista anterior.'
          },
          {
            strong: 'Paginación: ',
            detail: 'Botones para pasar de página en la grilla.'
          }
        ]
      }
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una administración eficiente de los gastos, manteniendo la integridad y precisión de los datos financieros.'
    ];    
  }
}
