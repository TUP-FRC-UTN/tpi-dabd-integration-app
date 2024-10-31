import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmAlertComponent, ToastService, MainContainerComponent } from 'ngx-dabd-grupo01';
import { Router } from '@angular/router';
import { UserFilterButtonsComponent } from '../user-filter-buttons/user-filter-buttons.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-user-list',
  standalone: true,
  imports: [UserFilterButtonsComponent, MainContainerComponent, NgbPagination, FormsModule],
  templateUrl: './user-user-list.component.html',
  styleUrl: './user-user-list.component.css'
})
export class UserUserListComponent {
    //#region SERVICIOS
    private router = inject(Router)
    private userService = inject(UserService)
    private toastService = inject(ToastService)
    private modalService = inject(NgbModal)
    //#endregion

    //#region ATT de PAGINADO
    currentPage: number = 0
    pageSize: number = 10
    sizeOptions : number[] = [10, 25, 50]
    usersList: User[] = [];
    filteredUsersList: User[] = [];
    lastPage: boolean | undefined
    totalItems: number = 0;
    //#endregion

    //#region ATT de ACTIVE
    retrieveUsersByActive: boolean | undefined = true;
    //#endregion

    //#region NgOnInit | BUSCAR
    ngOnInit() {
      this.getAllUsers();
    }

    ngAfterViewInit(): void {
      this.filterComponent.filter$.subscribe((filteredList: User[]) => {
        this.filteredUsersList = filteredList;
        this.currentPage = 0;
      });
    }

    @ViewChild('filterComponent') filterComponent!: UserFilterButtonsComponent<User>;
    @ViewChild('usersTable', { static: true }) tableName!: ElementRef<HTMLTableElement>;
    //#endregion

    //#region GET_ALL
    getAllUsers() {
      this.userService.getAllUsers(this.currentPage - 1, this.pageSize, this.retrieveUsersByActive).subscribe(
        response => {
          this.usersList = response.content.reverse();
          this.filteredUsersList = [...this.usersList].reverse();
          this.lastPage = response.last
          this.totalItems = response.totalElements;
        },
        error => {
          console.error('Error getting users:', error);
        }
      )
    }
    //#endregion

    //#region APLICACION DE FILTROS
    changeActiveFilter(isActive? : boolean) {
      this.retrieveUsersByActive = isActive
      this.getAllUsers();
    }
    //#endregion

    //#region DELETE
    assignUserToDelete(user: User) {
      const modalRef = this.modalService.open(ConfirmAlertComponent)
      modalRef.componentInstance.alertTitle='Confirmacion';
      modalRef.componentInstance.alertMessage=`Estas seguro que desea eliminar el usuario?`;
      modalRef.componentInstance.alertVariant='delete'

      modalRef.result.then((result) => {
        if (result && user.id) {
        
        this.userService.deleteUser(user.id, 1).subscribe(
          response => {
            this.toastService.sendSuccess('Usuario eliminado correctamente.')
          }, error => {
            this.toastService.sendError('Error al eliminar usuario.')
          }
        );
        }
      })
    }
    //#endregion

    //#region RUTEO
    updateUser(userId?: number) {
      this.router.navigate([`/user/form/${userId}`])
    }

    userDetail(userId? : number) {
      this.router.navigate([`/user/detail/${userId}`])
    }
    //#endregion

    //#region REACTIVAR
    reactivateUser(userId? : number) {
      // this.plotService.reactivatePlot(plotId, 1).subscribe(
      //   response => {
      //     location.reload();
      //   }
      // );
    }
    //#endregion

    //#region FUNCIONES PARA PAGINADO
    onItemsPerPageChange() {
      this.currentPage = 1;
      this.getAllUsers();
    }
  
    onPageChange(page: number) {
      this.currentPage = page;
      this.getAllUsers();
    }
    //#endregion

    //#region SHOW INFO | TODO
    showInfo() {
      // TODO: En un futuro agregar un modal que mostrara informacion de cada componente
    }
    //#endregion
}
