import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProvidersService } from '../../../../services/providers.service';
import { Company } from '../../../../models/suppliers/company.model';
import { CompanyService } from '../../../../services/suppliers/company.service';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-list-empresas-reg',
  standalone: true,
  imports: [MainContainerComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './list-empresas-reg.component.html',
  styleUrl: './list-empresas-reg.component.css'
})
export class ListEmpresasRegComponent {
  @ViewChild('activeCompaniesModal') modal!: any;
  companies: Company[] = [];

  get sortedCompanies(): Company[] {
    return [...this.companies].sort((a, b) => 
      new Date(a.registration).getTime() - new Date(b.registration).getTime()
    );
  }
  constructor(
    private modalService: NgbModal,
    private companyService: CompanyService
  ) {}

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (response) => {
        this.companies = response;
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });
  }

  openModal() {
    this.modalService.open(this.modal, { 
      size: 'lg',
      centered: true,
      scrollable: true
    });
  }
}
