import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoleService } from '../../../services/role.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { MainContainerComponent } from 'ngx-dabd-grupo01';

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

}
