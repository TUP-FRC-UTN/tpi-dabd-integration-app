import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Operations } from '../../../constants/operationContants';
import { CommonModule } from '@angular/common';
import { ToastService, MainContainerComponent } from 'ngx-dabd-grupo01';
import { InfoComponent } from '../../commons/info/info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainContainerComponent],
  templateUrl: './roles-form.component.html',
  styleUrl: './roles-form.component.css'
})
export class RolesFormComponent implements OnInit {
  private modalService = inject(NgbModal);
  roleForm: FormGroup;
  role: Role | undefined;
  id: string | null = "";

  constructor(private formBuilder: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private toastService: ToastService,
              private roleService: RoleService){
    this.roleForm = this.formBuilder.group({
      codeControl:['', [Validators.required, Validators.maxLength(4)]],
      nameControl:['', [Validators.required, Validators.maxLength(10)]],
      prettyNameControl:['', [Validators.required ,Validators.maxLength(25)]],
      descriptionControl: ['', [Validators.maxLength(50)]],
    });
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('roleId');
    if (this.id !== null) {
      this.roleService.getRole(Number.parseInt(this.id)).subscribe({
        next: (data) => {
          this.role = data;
          this.roleForm.patchValue({
            codeControl: this.role.code,
            nameControl: this.role.name,
            prettyNameControl: this.role.prettyName,
            descriptionControl: this.role.description
          })
          this.roleForm.controls['codeControl'].disable();
          this.roleForm.controls['nameControl'].disable();
        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  }

  setFieldsEnabled() {
    this.roleForm.enable();
  }

  setFieldsDisabled() {
    this.roleForm.disable();
  }

  navigateToList() {

    this.router.navigate(['/users/roles/list']);

  }

  createRole(){
    let newRole: any = {
      code: this.roleForm.value.codeControl,
      name: this.roleForm.value.nameControl,
      pretty_name: this.roleForm.value.prettyNameControl,
      description: this.roleForm.value.descriptionControl
    }
    this.roleService.createRole(newRole as Role).subscribe({
      next: () => {
        this.toastService.sendSuccess("Rol creado con éxito");
        this.navigateToList();
      },
      error: (error) => {
        console.error('Error creating plot:', error);
        this.toastService.sendError("Error creando el rol");
      }
    });
  }

  updateRole(id: number){
    let updateRole: any = {
      code: this.role?.code,
      name: this.roleForm.value.nameControl,
      pretty_name: this.roleForm.value.prettyNameControl,
      description: this.roleForm.value.descriptionControl,
    }
    this.roleService.updateRole(id, updateRole as Role).subscribe({
      next: () => {
        this.toastService.sendSuccess("Rol modificado con éxito");
        this.navigateToList();
      },
      error: (error) => {
        console.log(error);
        this.toastService.sendError("Error modificando el rol");
      }
    });
  }

  onSubmit() {
    if (this.roleForm.valid) {
      if (this.id === null) {
        this.createRole();
      }
      else{
        this.updateRole(Number.parseInt(this.id));
      }
    }
  }

  //#region Info Button
  openInfo() {
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true,
    });

    modalRef.componentInstance.title = 'Edición de roles';
    modalRef.componentInstance.description =
      'En esta pantalla se podrán editar los datos referidos al rol.';
    modalRef.componentInstance.body = [
      {
        title: 'Datos',
        content: [
          {
            strong: 'Código:',
            detail: 'Código del rol.',
          },
          {
            strong: 'Nombre:',
            detail: 'Nombre del rol en el sistema.',
          },
          {
            strong: 'Nombre detallado:',
            detail: 'Nombre detallado del rol, a diferencia con el nombre común, éste es el nombre por el cuál se identificará el rol.',
          },
          {
            strong: 'Descripción: ',
            detail: 'Descripción breve de lo que define el rol.',
          }
        ],
      },
      {
        title: 'Acciones',
        content: [
          {
            strong: 'Cancelar: ',
            detail:
              'Cancela la edición y vuelve a la vista anterior',
          },
          {
            strong: 'Guardar: ',
            detail: 'Guarda los cambios realizados en el rol',
          },
        ],
      }
    ];
    modalRef.componentInstance.notes = [
      'Los campos de código y nombre del rol no serán editables ya que se son sensibles para el uso del sistema.',
      'El nombre detallado es requerido para editar el rol.',
      'La interfaz está diseñada para ofrecer una administración eficiente de los roles, manteniendo la integridad y precisión de los datos.',
    ];
  }
  //#end region

}
