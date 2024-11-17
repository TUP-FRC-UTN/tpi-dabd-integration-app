// import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import {  Supplier } from '../../../models/supplier.model';
// import { ProvidersService } from '../../../services/providers.service';
// import Swal from 'sweetalert2';
// import { Router, RouterLink } from '@angular/router';
// import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ServiceType } from '../../../models/enums/service-tpye.enum';
// import { CommonModule } from '@angular/common';
// import { StatusType } from '../../../models/inventory.model';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// //exportar a pdf y excel
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import * as XLSX from 'xlsx';
// import autoTable from 'jspdf-autotable';
// import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
// import { ToastService } from 'ngx-dabd-grupo01';

// @Component({
//   selector: 'app-provider-list',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule, RouterLink, FormsModule],
//   templateUrl: './provider-list.component.html',
//   styleUrl: './provider-list.component.css',
//   schemas: [CUSTOM_ELEMENTS_SCHEMA] // Agrega esta línea
// })
// export class ProviderListComponent implements OnInit{
//   @ViewChild('providersTable') providersTable!: ElementRef;
  
//   mockProviders: Supplier[] = [
//     { id: 1, name: 'Proveedor 1', cuil: '20-12345678-9', service: 'Mantenimiento', contact: '1234567890', address: 'Calle 123', enabled: true },
//     { id: 2, name: 'Proveedor 2', cuil: '20-87654321-9', service: 'Limpieza', contact: '0987654321', address: 'Avenida 456', enabled: false },
//     { id: 3, name: 'Proveedor 3', cuil: '20-11111111-9', service: 'Seguridad', contact: '1111111111', address: 'Plaza 789', enabled: true },
//     { id: 4, name: 'Proveedor 4', cuil: '20-22222222-9', service: 'Transporte', contact: '2222222222', address: 'Ruta 012', enabled: false },
//     { id: 5, name: 'Proveedor 5', cuil: '20-33333333-9', service: 'Catering', contact: '3333333333', address: 'Boulevard 345', enabled: true }
//   ];

//   providerList: Supplier[] = [];
//   filteredProviders: Supplier[] = []; // Proveedores filtrados
//   private originalProviders: Supplier[] = [];
//   isLoading = false;
//   searchFilter = new FormControl('');
//   searchFilterAll = new FormControl('');

//   @ViewChild('infoModal') infoModal!: TemplateRef<any>;

//   sortedProviderList: Supplier[] = [];
//   sortColumn: string = '';
//   sortDirection: 'asc' | 'desc' = 'asc';


//   serviceTypes = Object.values(ServiceType);
//   statusTypes = Object.values(StatusType);

//   filterForm: FormGroup;
//   nameFilter = new FormControl('');
//   cuilFilter = new FormControl('');
//   serviceFilter = new FormControl('');
//   phoneFilter = new FormControl('');

//   showModalFilter: boolean = false;

//   currentPage: number = 1;
//   totalPages: number = 1;
//   itemsPerPage: number = 10;

//    // Track current filter state
//    currentFilter: 'all' | 'true' | 'false' = 'all';

//   private providerService = inject(ProvidersService);
//   private router = inject(Router);
//   private fb = inject(FormBuilder);
//   private modalService = inject(NgbModal);

//   constructor(private toastService: ToastService) {
//     this.filterForm = this.fb.group({
//       enabled: ['']
//     });
//   }

//   ngOnInit(): void {
//     // this.mockGetProviders(); //Para testear si funcionan
//     this.getProviders(); //Metodo real
//     this.setupFilterSubscriptions();  
//   }

//   openModalFilter(): void {
//     this.showModalFilter = true;
//   }

//   closeModalFilter(applyFilters: boolean): void {
//     this.showModalFilter = false;
//     if (applyFilters) {
//       this.applyFilters();
//     }
//   }
//   openModal(){

//   }

//   showInfo(): void {
//     this.modalService.open(this.infoModal, { centered: true });
//   }

//   private setupFilterSubscriptions(): void {
//     Object.keys(this.filterForm.controls).forEach(key => {
//       this.filterForm.get(key)?.valueChanges.pipe(
//         debounceTime(300),
//         distinctUntilChanged()
//       ).subscribe(() => {
//         this.applyFilters();
//       });
//     });
//   }


//   sortProviders(column: keyof Supplier): void {
//     // Cambia la dirección de orden si la columna ya está seleccionada, sino reinicia a 'asc'
//     this.sortDirection = this.sortColumn === column ? (this.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
//     this.sortColumn = column;
  
//     // Ordena la lista
//     this.providerList = [...this.providerList].sort((a, b) => {
//       const valueA = a[column];
//       const valueB = b[column];
  
//       if (valueA == null || valueB == null) return 0; // Evita ordenamiento si es null o undefined
  
//       if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
//       if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
//       return 0;
//     });
//   }
  
//   getSortIcon(column: string): string {
//     if (this.sortColumn === column) {
//       return this.sortDirection === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down';
//     }
//     return 'fa fa-sort';
//   }
  

//   trackByFn(index: number, item: Supplier): number {
//     return item.id; // Devuelve el ID del proveedor como clave
//   }

//   getProviders() {
//     this.isLoading = true;
//     this.nameFilter.valueChanges.subscribe( data => {
//       if(data === null || data === ''){
//         this.getProviders();
//       }
//       this.providerList = this.providerList.filter(
//         x => x.name.toLowerCase().includes(data!.toLowerCase())
//       )
//     })
//     this.cuilFilter.valueChanges.subscribe( data => {
//       if(data === null || data === ''){
//         this.getProviders();
//       }
//       this.providerList = this.providerList.filter(
//         x => x.cuil.toLowerCase().includes(data!.toLowerCase())
//       )
//     })
//     this.phoneFilter.valueChanges.subscribe( data => {
//       if(data === null || data === ''){
//         this.getProviders();
//       }
//       this.providerList = this.providerList.filter(
//         x => x.contact.toLowerCase().includes(data!.toLowerCase())
//       )
//     })
//     this.serviceFilter.valueChanges.subscribe( data => {
//       if(data === null || data === ''){
//         this.getProviders();
//       }
//       this.providerList = this.providerList.filter(
//         x => x.service.toLowerCase().includes(data!.toLowerCase())
//       )
//     })

//     this.searchFilterAll.valueChanges.subscribe( data => {
//       if(data === null || data === ''){
//         this.getProviders();
//       }
//       this.providerList = this.providerList.filter(
//         x => x.name.toLowerCase().includes(data!.toLowerCase())||
//          x.cuil.toLowerCase().includes(data!.toLowerCase())||
//          x.contact.toLowerCase().includes(data!.toLowerCase())||
//          x.service.toLowerCase().includes(data!.toLowerCase())
//       )
//     })
    
//     this.providerService.getProviders().subscribe((providerList) => {
//       this.filteredProviders = providerList;
//       this.providerList = providerList;
//       this.isLoading = false;
//     });
//   }

//   applyFilters(): void {
//     const filters = {
//       addressId: this.filterForm.get('addressId')?.value,
//       enabled: this.filterForm.get('enabled')?.value,
//       state: this.currentFilter === 'all' ? null : this.currentFilter === 'true'
//     };

//     // Eliminar propiedades con valores vacíos
//     Object.keys(filters).forEach(key => {
//       if (!filters[key as keyof typeof filters]) {
//         delete filters[key as keyof typeof filters];
//       }
//     });

//     this.providerService.getProviders(filters).subscribe(providers => {
//       this.providerList = providers;
//       this.filteredProviders = providers;
//       this.originalProviders = providers;
//     });
    
//   }
  
//   // Método para buscar proveedores por CUIL
//   searchByCUIL(): void {
//     const cuil = this.filterForm.get('cuil')?.value;
//     if (cuil) {
//       this.filteredProviders = this.providerList.filter(provider => provider.cuil.includes(cuil));
//     } else {
//       this.filteredProviders = this.providerList; // Restablece la lista si no hay CUIL ingresado
//     }
//   }
//   searchByContact() {
//     this.applyFilters();
//   }

//   clearSearch() {
//     this.nameFilter.reset();
//     this.cuilFilter.reset();
//     this.serviceFilter.reset();
//     this.phoneFilter.reset();
//     this.filterForm.reset({
//       addressId: '',
//       enabled: ''
//     });
//     this.currentFilter = 'all';
//     this.showAllProviders();
//     this.applyFilters();
//   }

//   editProvider(id: number) {
//     this.router.navigate(['/providers/form', id]);
//   }

//   deleteProvider(id: number){
//     Swal.fire({
//       title: '¿Estás seguro?',
//       text: 'No podras revertir esto!',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Si, eliminar!',
//       cancelButtonText: 'Cancelar'
//     }).then((result) => {
//       if(result.isConfirmed){
//         this.providerService.deleteProvider(id).subscribe({
//           next: (response) => {
//             this.toastService.sendSuccess("El proveedor ha sido eliminado con éxito.");
//             this.getProviders();
//           },
//           error: (error) => {
//             this.toastService.sendError("Hubo un error en la eliminación del proveedor.");
//           }
//         });
//       }
//     })
//   }

//   exportToPDF() {
//     const doc = new jsPDF();
//     const tableColumn = ['Nombre', 'CUIL', 'Tipo de servicio', 'Dirección', 'Numero de Telefono', 'Estado'];
//     const tableRows: any[][] = [];
  
//     this.providerList.forEach((provider) => {
//       // const providerAddress = this.addresses.find((addr) => addr.id === provider.addressId);
//       const providerData = [
//         provider.name,
//         provider.cuil,
//         provider.service,
//         // providerAddress ? providerAddress.street_address : 'N/A', // Mostramos la dirección
//         provider.enabled ? 'Activo' : 'Inactivo'
//       ];
//       tableRows.push(providerData);
//     });
  
//     autoTable(doc, {
//       head: [tableColumn],
//       body: tableRows,
//     });
  
//     doc.save('proveedores.pdf');
//   }

//   exportToExcel() {
//     try {
//       let element = document.getElementById('providersTable');
//       if (!element) {
//         console.warn('Table element not found in DOM, using component data instead.');
//         element = this.createTableFromData();
//       }
//       const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
//       const wb: XLSX.WorkBook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
//       XLSX.writeFile(wb, 'proveedores.xlsx');
//     } catch (error) {
//       console.error('Error exporting to Excel:', error);
//       // Aquí puedes añadir una notificación al usuario si lo deseas
//     }
//   }

//   private createTableFromData(): HTMLTableElement {
//     const table = document.createElement('table');
//     const thead = table.createTHead();
//     const tbody = table.createTBody();

//     // Crear encabezados
//     const headerRow = thead.insertRow();
//     ['Nombre', 'Tipo de servicio', 'Contacto', 'Estado'].forEach(text => {
//       const th = document.createElement('th');
//       th.textContent = text;
//       headerRow.appendChild(th);
//     });

//     // Crear filas de datos
//     // this.providerList.forEach(provider => {
//     //   const row = tbody.insertRow();
//     //   [provider.name, provider.serviceType, provider.contact, provider.state].forEach(text => {
//     //     const cell = row.insertCell();
//     //     cell.textContent = text;
//     //   });
//     // });
//     this.providerList.forEach((provider) => {
//       // const providerAddress = this.addresses.find((addr) => addr.id === provider.addressId);
//       const row = tbody.insertRow();
//       [provider.name, provider.cuil, provider.service, 
//         // providerAddress ? providerAddress.street_address : 'N/A',
//          provider.enabled ? 'Activo' : 'Inactivo'].forEach((text) => {
//         const cell = row.insertCell();
//         cell.textContent = text;
//       });
//     });

//     return table;
//   }
//   goToNextPage() {
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//       // Actualizar lista de empleados
//     }
//   }
  
//   goToPreviousPage() {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//       // Actualizar lista de empleados
//     }
//   }


//   /* Metodos de filtrado por botones*/
//   filterActiveProviders(): void {
//     console.log(this.providerList.filter(provider => provider.enabled));
//     this.currentFilter = 'true';
//     //Para mockear
//     this.providerList = this.originalProviders.filter(provider => provider.enabled);
//     this.filteredProviders = [...this.providerList];
//     console.log("Estas usando el filtro activo");
//     //Pegada a la api
//     //this.applyFilters();
//   }

//   filterInactiveProviders(): void {
//     console.log(this.providerList.filter(provider => !provider.enabled));
//     this.currentFilter = 'false';
//     //Para mockear
//     this.providerList = this.originalProviders.filter(provider => !provider.enabled);
//     this.filteredProviders = [...this.providerList];
//     console.log("Estas usando el filtro inactivo");
//      //Pegada a la Api
//     //this.applyFilters();
//   }

//   showAllProviders(): void {
//     console.log(this.providerList)
//     this.currentFilter = 'all';
//     //Para mockear
//     this.providerList = [...this.originalProviders];
//     this.filteredProviders = [...this.originalProviders];
//     console.log("Estas usando el filtro todos");
//     //Pegada a la Api
//     this.applyFilters();
//   }
//   // Modified to use mock data
//   mockGetProviders() {
//     this.isLoading = true;
//     // Simulate API call delay
//     setTimeout(() => {
//    // Guardar una copia de los datos originales
//    this.originalProviders = [...this.mockProviders];
//    this.providerList = [...this.mockProviders];
//    this.filteredProviders = [...this.mockProviders];
//    this.isLoading = false;
//  }, 500);

//     // Keep existing filter subscriptions
//     this.nameFilter.valueChanges.subscribe(data => {
//       if (data === null || data === '') {
        
//       }
//       this.filteredProviders = this.providerList.filter(
//         x => x.name.toLowerCase().includes(data!.toLowerCase())
//       );
//     });

//     // ... (rest of the existing filter subscriptions)
//     console.log("Estas usando el metodo mockGetProviders");
//   }
//   // Helper method to apply current filter state

//  /* private applyCurrentFilter(): void {
//     switch (this.currentFilter) {
//       case 'true':
//         this.providerList = this.originalProviders.filter(provider => provider.enabled);
//         break;
//       case 'false':
//         this.providerList = this.originalProviders.filter(provider => !provider.enabled);
//         break;
//       default:
//         this.providerList = [...this.originalProviders];
//     }
//     this.filteredProviders = [...this.providerList];
//     console.log("Estas usando el metodo appluyCurrentFilter");
//   }*/
 
//     // Método para actualizar el filtro y la lista de proveedores en función del estado activo/inactivo
//  setFilter(filter: 'all' | 'true' | 'false'): void {
//   this.currentFilter = filter;
//   //this.applyCurrentFilter();
//   this.applyFilters();
//   console.log("Estas usando el metodo setFilter");
// }
// }
