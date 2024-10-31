import { Component, inject, Input } from '@angular/core';
import { Account } from '../../../models/account';
import { AccountService } from '../../../services/account.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlotService } from '../../../services/plot.service';
import { MainContainerComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-account-account-list',
  standalone: true,
  imports: [CommonModule, MainContainerComponent],
  templateUrl: './account-account-list.component.html',
  styleUrl: './account-account-list.component.css'
})
export class AccountAccountListComponent {
  private accountService = inject(AccountService);
  private plotService = inject(PlotService)
  private router = inject(Router)

  currentPage: number = 0
  pageSize: number = 10
  plotId: number | undefined
  accountList: Account[] = [];
  lastPage: boolean = false;

  ngOnInit() {
    this.getAllAcounts()
  }

  getAllAcounts() {
    // TODO: Cuando le pegues el getAll vas a tener que hacer un
    // getById en el servicio de plots y rellenar los campos de nro manzana
    // y nro de lote.
    this.accountList = this.accountService.getAllPlots();
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
}
