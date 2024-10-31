import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeType } from '../../../models/employee.model';
import { DocumentType } from '../../../models/employee.model';
import { StatusType } from '../../../models/employee.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeesService } from '../../../services/employees.service';
import { Employee } from '../../../models/employee.model';
import { debounceTime, map, switchMap } from 'rxjs';
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { ToastService } from 'ngx-dabd-grupo01';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss'],
})
export class EmployeeFormComponent implements OnInit {
  employeeForm = new FormGroup({
    id:new FormControl(0),
    firstName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    employeeType: new FormControl(EmployeeType.ADMIN, Validators.required),
    hiringDate: new FormControl(new Date().toISOString().split('T')[0], [Validators.required]), // Default to today
    documentType: new FormControl(DocumentType.DNI, Validators.required),
    docNumber: new FormControl('', [Validators.required, Validators.pattern(/^[0-9.-]*$/)]),
    salary: new FormControl(0, [Validators.required, Validators.min(0)]),
    state: new FormControl(StatusType.ACTIVE),
  });

  constructor(private toastService: ToastService) {}

  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  private readonly employeeService = inject(EmployeesService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mapperService = inject(MapperService);
  private modalService = inject(NgbModal);
  employeeTypes= Object.values(EmployeeType);
  documentTypes= Object.values(DocumentType);
  private currentId = 0;
  isEdit:boolean=false;


  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const id = +params['id'];
      console.log(id);
      if (id) {
        this.getById(id);
      }
    });
  }

  getById(id: number) {
    this.currentId=id;
    this.employeeService.getEmployee(id).subscribe((data) => {
      data = this.mapperService.toCamelCase(data);
      this.employeeForm.patchValue({
        id:data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        employeeType: data.employeeType,
        hiringDate: new Date(data.hiringDate).toISOString().split('T')[0], // Format for input
        documentType: data.documentType,
        docNumber: data.docNumber,
        state: StatusType.ACTIVE,
        salary: data.salary,
      });
    });
    this.isEdit=true;
  }

  saveEmployee() {
    if (this.employeeForm.valid) {
      let employeeData = this.prepareEmployeeData();
      employeeData = this.mapperService.toSnakeCase(employeeData);
      console.log(employeeData);
      if (this.currentId!=0) {
        employeeData.id=this.currentId;
        this.updateEmployee(employeeData);
      } else {
        employeeData.id
        this.createEmployee(employeeData);
        this.router.navigate(['/employee-list']); // Redirect to employee list       
      }
    }
  }
    resetForm() : void {
      this.employeeForm.reset({
        id:0,
        firstName: '',
        lastName: '',
        employeeType: EmployeeType.ADMIN,
        hiringDate: new Date().toISOString().split('T')[0],
        documentType: DocumentType.DNI,
        docNumber: '',
        state: StatusType.ACTIVE,
        salary: 0
      })
    }

  prepareEmployeeData(): Employee {
    const { id, firstName, lastName, employeeType, hiringDate, documentType, docNumber, salary, state } = this.employeeForm.value;    
    let parsedHiringDate: Date | null = new Date();
    /*if (hiringDate) {
      parsedHiringDate = new Date(hiringDate);
    }*/

    return {
      id,
      firstName,
      lastName,
      employeeType,
      documentType: documentType,
      docNumber,
      hiringDate,
      salary,
      state,
    } as Employee;
  }

  showInfo(): void {
    this.modalService.open(this.infoModal, { centered: true });
  }

  createEmployee(employee: Employee) {
    this.employeeService.addEmployee(employee).subscribe({
      next: (response) => {
        this.toastService.sendSuccess("El Empleado ha sido creado con éxito.");
        this.resetForm(); // Limpia el formulario
      },
      error: (error) => {
        this.toastService.sendError("Hubo un error en la creación del empleado.");
      } 
    });
  }

  updateEmployee(employee: Employee) {
    console.log(employee);
    this.employeeService.updateEmployee(employee).subscribe({
      next: (response) => {
        this.toastService.sendSuccess("El Empleado ha sido modificado con éxito.");
      },
      error: (error) => {
        this.toastService.sendError("Hubo un error en la modificación del empleado.");
      }
    });
  }

  return() {
    this.router.navigate(['employees/list']);
  }

  documentExistsValidator(control: AbstractControl) {
    return control.valueChanges.pipe(
      debounceTime(300), // para evitar múltiples llamadas al backend
      switchMap((documentNumber) => 
        this.employeeService.checkIfDocumentExists(documentNumber)
      ),
      map((exists: boolean) => (exists ? { documentExists: true } : null))
    );
}
}