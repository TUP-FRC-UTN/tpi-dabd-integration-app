import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProvidersService } from '../../../../services/providers.service';
import { Supplier } from '../../../../models/suppliers/supplier.model';

@Component({
  selector: 'app-list-provider-reg',
  standalone: true,
  imports: [],
  templateUrl: './list-provider-reg.component.html',
  styleUrl: './list-provider-reg.component.css'
})
export class ListProviderRegComponent implements OnInit{
  @ViewChild('activeProvidersModal') modal!: any;

  private modalService = inject(NgbModal);
  private providerService = inject(ProvidersService);

  providersList: Supplier[] = [];

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders() {
    this.providerService.getProviders().subscribe( {
      next: (response) => {
        this.providersList = response.content;
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
