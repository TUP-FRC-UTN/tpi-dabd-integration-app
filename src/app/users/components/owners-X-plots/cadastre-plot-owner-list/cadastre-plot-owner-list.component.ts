import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Plot, PlotStatusDictionary, PlotTypeDictionary } from '../../../models/plot';
import { OwnerPlotService } from '../../../services/owner-plot.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OwnerService } from '../../../services/owner.service';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { CadastrePlotOwnerFilterButtonsComponent } from '../cadastre-plot-owner-filter-buttons/cadastre-plot-owner-filter-buttons.component';

@Component({
  selector: 'app-cadastre-plot-owner-list',
  standalone: true,
  imports: [NgbPagination, FormsModule, MainContainerComponent, CadastrePlotOwnerFilterButtonsComponent],
  templateUrl: './cadastre-plot-owner-list.component.html',
  styleUrl: './cadastre-plot-owner-list.component.css'
})
export class CadastrePlotOwnerListComponent {
  private ownerPlotService = inject(OwnerPlotService);
  private ownerService = inject(OwnerService);
  private activatedRoute = inject(ActivatedRoute);
  private location = inject(Location)
  private router = inject(Router)

  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
  plotsList: Plot[] = []
  lastPage: boolean | undefined
  totalItems: number = 0;
  ownerId: number = NaN
  title : string = "Lista de lotes actuales de ";

  ownerFirstName : string = ""
  ownerLastName : string = ""
  plotBlock : string = ""
  plotNumber : string = ""
  plotId : number | undefined = undefined

  retrievePlotsByActive: boolean | undefined = true;
  
  plotTypeDictionary = PlotTypeDictionary;
  plotStatusDictionary = PlotStatusDictionary;
  plotDictionaries = [this.plotTypeDictionary, this.plotStatusDictionary]

  @ViewChild('filterComponent') filterComponent!: CadastrePlotOwnerFilterButtonsComponent<Plot>;
  @ViewChild('plotOwnersTable', { static: true }) tableName!: ElementRef<HTMLTableElement>;

  ngOnInit() {
    this.ownerId = Number(this.activatedRoute.snapshot.paramMap.get('ownerId'));
    this.getOwnerById();
    this.getPlotsByOwner();
  }

  getPlotsByOwner() {
    this.ownerPlotService.giveAllPlotsByOwner(this.ownerId, this.currentPage, this.pageSize).subscribe(
      response => {
        this.plotsList = response.content;
        this.lastPage = response.last;
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting owners:', error);
      }
    )
  }

  getOwnerById() {
    this.ownerService.getOwnerById(this.ownerId).subscribe(
      response => {
        this.title += response.firstName + " " + response.lastName
        this.ownerFirstName = response.firstName
        this.ownerLastName = response.lastName
      }
    )
  }

  changePage(forward: boolean) {
    forward ? this.currentPage++ : this.currentPage--
    this.getPlotsByOwner();
  }

  viewOwnerDetail() {
    this.router.navigate(["/owner/detail/" + this.ownerId])
  }

  viewPlotDetail(plotId : number) {
    this.router.navigate(["/plot/detail/" + plotId])
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

  assignPlotToRemove(plot: Plot) {
    this.plotNumber = plot.plotNumber;
    this.plotBlock = plot.blockNumber;
    this.plotId = plot.id
  }

  removePlot() {
    if (this.plotId !== undefined) {
    this.ownerPlotService.removePlot(this.plotId, this.ownerId).subscribe(
      response => location.reload()
      );
    }
  }

  cleanPlotId() {
    this.plotId = undefined
  }

  onItemsPerPageChange() {
    --this.currentPage
    this.getPlotsByOwner();
  }
    
  onPageChange(page: number) {
    this.currentPage = --page; 
    this.getPlotsByOwner();
  }

  goBack() {
    this.location.back()
  }
}
