import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoleService } from '../../../services/role.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { InfoComponent } from '../../commons/info/info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-roles-detail',
  standalone: true,
  imports: [ReactiveFormsModule, MainContainerComponent],
  templateUrl: './roles-detail.component.html',
  styleUrl: './roles-detail.component.css'
})
export class RolesDetailComponent implements OnInit{
  role: any;
  roleForm: FormGroup;
  private modalService = inject(NgbModal)

  constructor(private roleService: RoleService,
              private activatedRoute: ActivatedRoute,
              private location: Location)
  {
    this.roleForm = new FormGroup({
      codeControl: new FormControl(),
      nameControl: new FormControl(),
      prettyNameControl: new FormControl(),
      descriptionControl: new FormControl()
    })
  }

  ngOnInit(): void {
    let id = this.activatedRoute.snapshot.paramMap.get('roleId');
    if(id != null){
      this.roleService.getRole(parseInt(id)).subscribe({
        next: (data) => {
          this.role = data;
          this.roleForm.patchValue({
            codeControl: this.role.code,
            nameControl: this.role.name,
            prettyNameControl: this.role.prettyName,
            descriptionControl: this.role.description
          });
          this.roleForm.disable();
        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  }

  goBack() {
    this.location.back();
  }

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });   
    
    modalRef.componentInstance.title = 'Detalles del rol';
    modalRef.componentInstance.description = 'En esta pantalla se permite visualizar los datos del rol de manera detallada.';
    modalRef.componentInstance.body = [
      { 
        title: 'Datos', 
        content: [
          {
            strong: 'Código:',
            detail: 'Código del rol.'
          },
          {
            strong: 'Nombre:',
            detail: 'Nombre del rol en el sistema.'
          },
          {
            strong: 'Nombre detallado:',
            detail: 'Nombre detallado del rol, a diferencia con el nombre común, éste es el nombre por el cuál se identificará el rol.'
          },
          {
            strong: 'Descripción:',
            detail: 'Descripción breve de lo que define el rol.'
          }
        ]
      }
    ];
    modalRef.componentInstance.notes = ['La interfaz está diseñada para ofrecer una administración eficiente, manteniendo la integridad y seguridad de los datos de los roles.'];
  }

}
