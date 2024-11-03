import { Component, inject } from '@angular/core';
import { AccountService } from '../../../services/account.service';
import { Router } from '@angular/router';
import { AccountingConcept, ConceptTypes } from '../../../models/account';
import { CommonModule, Location } from '@angular/common';
import { MainContainerComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-account-account-concept',
  standalone: true,
  imports: [CommonModule, MainContainerComponent],
  templateUrl: './account-account-concept.component.html',
  styleUrl: './account-account-concept.component.css'
})
export class AccountAccountConceptComponent {
  private accountService = inject(AccountService);
  private router = inject(Router)
  private location = inject(Location)

  currentPage: number = 0
  pageSize: number = 10
  plotId: number | undefined
  conceptList: AccountingConcept[] = [];
  lastPage: boolean = false;

  conceptTypesDictionary = ConceptTypes;

  ngOnInit() {
    this.getAllAcounts()
  }

  getAllAcounts() {
    this.conceptList = this.accountService.getConceptsByPlotId(1);
  }

  changePage(forward: boolean) {
    forward ? this.currentPage++ : this.currentPage--
  }

  viewPlotDetail(plotId : number) {
    this.router.navigate(["/plot/detail/" + plotId])
  }

  viewConcept(accountId : number) {
    this.router.navigate(["/account/concept/" + accountId])
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
