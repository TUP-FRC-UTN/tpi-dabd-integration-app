import { Component, inject, NgModule, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableColumn, TableComponent } from 'ngx-dabd-grupo01';
import { Visitor } from '../../../models/visitors/visitor.model';
import { VisitorService } from '../../../services/visitors/visitor.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableComponent , NgbModule],
  templateUrl: './visitor-list.component.html',
})
export class VisitorListComponent {

//   private visitorService = inject(VisitorService);
//   private router = inject(Router);

//   visitors: Visitor[] = [];
//   isLoading = true;
//   searchFilter: string = '';

//   @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>; // Accedemos al ng-template
//   columns: TableColumn[] = [];

//   ngAfterViewInit(): void {
//     setTimeout(() => {
//       // Configuramos las columnas, incluyendo la de acciones
//       this.columns = [
//         { headerName: 'Tipo de documento', accessorKey: 'doc_type' },
//         { headerName: 'Numero de documento', accessorKey: 'doc_number' },
//         { headerName: 'Nombre', accessorKey: 'name' },
//         { headerName: 'Apellido', accessorKey: 'last_name' },
//         {
//           headerName: 'Acciones',
//           accessorKey: 'actions',
//           cellRenderer: this.actionsTemplate, // Renderizamos la plantilla de acciones
//         },
//       ];
//     });
//   }

//   page: number = 1;
//   size: number = 10;
//   totalItems: number = 0;


//   ngOnInit(): void {
//     this.loadVisitors();
//   }

//   loadVisitors(filter?: string): void {
//     this.isLoading = true;
//     this.visitorService.getVisitors(this.page -1, this.size , filter).subscribe({
//     next: (data) => {
//       console.log(data)
//       this.visitors = data.items;
//       this.totalItems = data.total_elements;
//       this.isLoading = false;
//     },
//     error : (error) => {
//       console.log(error);
//     }
//     });
//   }


//   onPageChange = (page: number): void => {
//     this.page = page;
//     this.loadVisitors();
//   };

//   onPageSizeChange = (size: number): void => {
//     this.size = size;
//     this.loadVisitors();
//   };

//  onFilterChange = (filter: string): void => {
//     console.log(filter);

//     if(filter === '') {
//       this.loadVisitors();
//     }else{
//       this.loadVisitors(filter);
//     }
//   };


//   editVisitor(idVisitor: number): void {

//     this.router.navigate(['visitor/edit/'+ idVisitor]);
//   }

//   deleteVisitor(id: number): void {
//     if (confirm('¿Está seguro que quiere eliminar este visitante?')) {
//       this.visitorService.deleteVisitor(id).subscribe(() => {
//         this.visitors = this.visitors.filter((v) => v.visitor_id !== id);
//       });
//     }
//   }
}
