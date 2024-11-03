import { Component, inject } from '@angular/core';
import { AccountService } from '../../../services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountingConcept, ConceptTypes } from '../../../models/account';
import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { MainContainerComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-account-account-concept',
  standalone: true,
  imports: [CommonModule, MainContainerComponent, CurrencyPipe],
  templateUrl: './account-account-concept.component.html',
  styleUrl: './account-account-concept.component.css'
})
export class AccountAccountConceptComponent {
  private accountService = inject(AccountService);
  private activatedRoute = inject(ActivatedRoute)
  private location = inject(Location)

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
  conceptList: AccountingConcept[] = [];
  lastPage: boolean | undefined
  totalItems: number = 0;
  //#endregion

  plotId: number = 1;
  conceptTypesDictionary = ConceptTypes;

  ngOnInit() {
    
  }

  getAllConcepts(plotId: number) {
    this.accountService.getConceptsByPlotId(plotId, -1, this.pageSize).subscribe(
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
    this.location.back();
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    return new Intl.DateTimeFormat('es-AR', options).format(date);
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
}
