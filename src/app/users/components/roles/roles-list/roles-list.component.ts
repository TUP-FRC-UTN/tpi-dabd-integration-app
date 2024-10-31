import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RolesFilterButtonsComponent } from '../roles-filter-buttons/roles-filter-buttons.component';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import { Operations } from '../../../constants/operationContants';
import { Router } from '@angular/router';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ConfirmAlertComponent, MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [RolesFilterButtonsComponent, FormsModule, NgbPagination, MainContainerComponent],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.css'
})
export class RolesListComponent implements OnInit{
  @ViewChild('filterComponent') filterComponent!: RolesFilterButtonsComponent<Role>;
  @ViewChild('rolesTable', { static: true }) tableName!: ElementRef<HTMLTableElement>;

  roles: Role[] = [];
  filteredRoles: Role[] = []
  currentPage: number = 0
  pageSize: number = 10
  totalItems: number = 0;
  sizeOptions : number[] = [10, 25, 50]
  roleId: number | undefined;
  lastPage: boolean | undefined;
  retrieveRolesByActive: boolean | undefined = true;

  constructor( private roleService: RoleService, 
    private router: Router, 
    private modalService: NgbModal, 
    private toastService: ToastService)
  { }

  ngOnInit(): void {    
    this.getAllRoles();    
  }

  ngAfterViewInit(): void {
    this.filterComponent.filter$.subscribe((filteredList: Role[]) => {    
      this.filteredRoles = filteredList;      
      this.currentPage = 0;
    });
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    // this.confirmFilterPlot(); funcion para filtrar roles
  }

  onPageChange(page: number) {
    this.currentPage = page;
    // this.confirmFilterPlot(); funcion para filtrar roles
  }

  changeActiveFilter(isActive? : boolean) {
    this.retrieveRolesByActive = isActive;
    this.getAllRoles();
  }

  getAllRoles(){
    this.roleService.getAllRoles(this.currentPage - 1, this.pageSize, this.retrieveRolesByActive).subscribe({
      next: (response: any) => {        
        this.roles = response.content;
        this.filteredRoles = [...this.roles];
        this.lastPage = response.last;
        this.totalItems = response.totalElements;       
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      },
    });
  }    

  assignPlotToDelete(role: Role) {
    const modalRef = this.modalService.open(ConfirmAlertComponent)
    modalRef.componentInstance.alertTitle='Confirmacion';
    modalRef.componentInstance.alertMessage=`Esta seguro que desea eliminar el rol: ${role.prettyName}?`;
    modalRef.componentInstance.alertVariant='delete'

    modalRef.result.then((result) => {
      if (result) {
        this.roleService.deleteRole(role.id, 1).subscribe({
          next: () => { 
            this.toastService.sendSuccess('Rol eliminado correctamente.'); 
            this.getAllRoles();
          },
          error: () => { this.toastService.sendError('Error al eliminar Rol.'); }
        });
      }
    })
  }

  reactivatePlot(roleId : number) {
    this.roleService.reactiveRole(roleId, 1).subscribe({
      next: () => { 
        this.toastService.sendSuccess('Rol reactivado correctamente.');
        this.getAllRoles();
      },
      error: () => { this.toastService.sendError('Error al reactivar Rol.'); }
    });
  }

  updateRole(roleId: number | undefined) {
    if(roleId != undefined){
      this.router.navigate(['roles/form/' + roleId]);
    }    
  }

  detailRole(roleId: number | undefined) {
    if(roleId != undefined){
      this.router.navigate(['roles/detail/' + roleId]);
    }
  }
}