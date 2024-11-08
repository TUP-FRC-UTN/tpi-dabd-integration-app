import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Owner } from '../../../models/owner';
import { OwnerPlotService } from '../../../services/owner-plot.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlotService } from '../../../services/plot.service';
import { OwnerPlotHistoryDTO } from '../../../models/ownerXplot';
import { Location } from '@angular/common';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { CadastreOwnerPlotFilterButtonsComponent } from '../cadastre-owner-plot-filter-buttons/cadastre-owner-plot-filter-buttons.component'
import { DocumentTypeDictionary, OwnerTypeDictionary} from '../../../models/owner';
import { InfoComponent } from '../../commons/info/info.component';

@Component({
  selector: 'app-cadastre-owner-plot-list',
  standalone: true,
  imports: [NgbPagination, FormsModule, MainContainerComponent, CadastreOwnerPlotFilterButtonsComponent],
  templateUrl: './cadastre-owner-plot-list.component.html',
  styleUrl: './cadastre-owner-plot-list.component.css'
})
export class CadastreOwnerPlotListComponent {
  private ownerPlotService = inject(OwnerPlotService);
  private plotService = inject(PlotService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location)
  private modalService = inject(NgbModal)

  currentPage: number = 0
  pageSize: number = 10
  ownersList: OwnerPlotHistoryDTO[] = []
  sizeOptions : number[] = [10, 25, 50]
  lastPage: boolean | undefined
  totalItems: number = 0;
  plotId: number = NaN
  title : string = "Lista de dueños historicos del lote. Manzana: ";

  documentTypeDictionary = DocumentTypeDictionary;
  ownerTypeDictionary = OwnerTypeDictionary;
  ownerDictionaries = [this.documentTypeDictionary, this.ownerTypeDictionary]

  @ViewChild('filterComponent') filterComponent!: CadastreOwnerPlotFilterButtonsComponent<OwnerPlotHistoryDTO>;
  @ViewChild('ownersPlotTable', { static: true }) tableName!: ElementRef<HTMLTableElement>;

  ngOnInit() {
    this.plotId = Number(this.activatedRoute.snapshot.paramMap.get('plotId'));
    this.getPlot()
    this.getOwnersByPlot();
  }

  getOwnersByPlot() {
    this.ownerPlotService.giveAllOwnersByPlot(this.plotId, this.currentPage, this.pageSize).subscribe(
      response => {
        this.ownersList = response.content;
        this.lastPage = response.last
        this.totalItems = response.totalElements
      },
      error => {
        console.error('Error getting owners:', error);
      }
    )
  }

  getPlot() {
    this.plotService.getPlotById(this.plotId).subscribe(
      response => {
        this.title += response.blockNumber + " Nro: " + response.plotNumber
      },
      error => {
        console.error('Error getting owners:', error);
      }
    )
  }

  viewOwnerDetail(ownerId : number) {
    this.router.navigate(["/users/owner/detail/" + ownerId])
  }

  viewPlotDetail() {
    this.router.navigate(["/users/plot/detail/" + this.plotId])
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    return new Intl.DateTimeFormat('es-AR', options)
      .format(date)
      .replace(',', '');
  }

  onItemsPerPageChange() {
    --this.currentPage
    this.getOwnersByPlot();
  }

  onPageChange(page: number) {
    this.currentPage = --page;
    this.getOwnersByPlot();
  }

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

    modalRef.componentInstance.title = 'Lista de dueños históricos del lote';
    modalRef.componentInstance.description = 'Esta vista lista todos los dueños históricos del lote junto con sus respectivas características.';
    modalRef.componentInstance.body = [
      {
        title: 'Datos',
        content: [
          {
            strong: 'Nombre: ',
            detail: 'Nombre completo del propietario.'
          },
          {
            strong: 'Apellido: ',
            detail: 'Apellido del propietario.'
          },
          {
            strong: 'Tipo documento: ',
            detail: 'Tipo del documento del propietario.'
          },
          {
            strong: 'N° documento: ',
            detail: 'Número del documento del propietario.'
          },
          {
            strong: 'Tipo Propietario: ',
            detail: 'Clasificación del propietario'
          },
          {
            strong: 'Fecha de Inicio: ',
            detail: 'Fecha de inicio de propiedad.'
          },
          {
            strong: 'Fecha de Fin: ',
            detail: 'Fecha de finalización de propiedad. (Cuando el propietario vende la propiedad)'
          }
        ]
      },
      {
        title: 'Acciones',
        content: [
        ]
      },
      {
        title: 'Funcionalidades de los botones',
        content: [
          {
            strong: 'Exportar a Excel: ',
            detail: 'Botón verde que exporta la grilla a un archivo de Excel.'
          },
          {
            strong: 'Exportar a PDF: ',
            detail: 'Botón rojo que exporta la grilla a un archivo de PDF.'
          },
          {
            strong: 'Paginación: ',
            detail: 'Botones para pasar de página en la grilla.'
          },
          {
            strong: 'Volver: ',
            detail: 'Vuelve a la vista anterior.'
          }
        ]
      }
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una administración eficiente de los dueños históricos del lote, manteniendo la integridad y precisión de los datos.'
    ];
  }
}
