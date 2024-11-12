import {Component, inject, OnInit} from '@angular/core';
import {ReportPeriodService} from "../../../services/report-period/report-period.service";
import {MainContainerComponent, TableFiltersComponent} from "ngx-dabd-grupo01";
import {CurrencyPipe, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-top-supliers',
  standalone: true,
  imports: [
    MainContainerComponent,
    TableFiltersComponent,
    NgIf,
    NgForOf,
    CurrencyPipe
  ],
  templateUrl: './top-supliers.component.html',
  styleUrl: './top-supliers.component.css'
})
export class TopSupliersComponent implements OnInit{
  topSuppliers: any[] = [];
  filteredSuppliers: any[] = [];
  private reportPeriodService = inject(ReportPeriodService);




  ngOnInit(): void {
    this.loadTopSuppliers();
  }

  loadTopSuppliers() {
    // Aquí debes cargar los datos. Asumo que reportPeriodService te da acceso a los datos
    this.reportPeriodService.getReportPeriods([1, 2, 3]).subscribe({
      next: (data) => {
        this.processTopSuppliers(data);
      },
      error: (err) => {
        console.error('Error loading suppliers', err);
      },
    });
  }

  processTopSuppliers(reportPeriod: any) {
    const suppliers = reportPeriod?.resume?.supplier_ordinary;

    if (suppliers && suppliers.length > 0) {
      suppliers.sort((a: any, b: any) => b.totalAmount - a.totalAmount);
      this.topSuppliers = suppliers.slice(0, 10);
      this.filteredSuppliers = [...this.topSuppliers];
    } else {
      this.topSuppliers = [];
      this.filteredSuppliers = [];
    }
  }

  onSearchChange(event: any) {
    const searchTerm = event.target.value.toLowerCase().trim();

    if (searchTerm) {
      this.filteredSuppliers = this.topSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredSuppliers = [...this.topSuppliers];
    }
  }

}
