import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Owner } from '../../../models/owner';
import { OwnerPlotService } from '../../../services/owner-plot.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlotService } from '../../../services/plot.service';
import { OwnerPlotHistoryDTO } from '../../../models/ownerXplot';
import { Location } from '@angular/common';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { CadastreOwnerPlotFilterButtonsComponent } from '../cadastre-owner-plot-filter-buttons/cadastre-owner-plot-filter-buttons.component'
import { DocumentTypeDictionary, OwnerTypeDictionary} from '../../../models/owner';

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
    this.router.navigate(["/owner/detail/" + ownerId])
  }

  viewPlotDetail() {
    this.router.navigate(["/plot/detail/" + this.plotId])
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
}
