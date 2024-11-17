import { Component, inject, TemplateRef } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-appeal-days-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './appeal-days-form.component.html',
  styleUrl: './appeal-days-form.component.scss',
})
export class AppealDaysFormComponent {
  //services

  private modalService = inject(NgbModal);
  private configService = inject(ConfigurationService);

  //variables
  closeResult = '';
  daysToAppeal = 10;

  //form
  maxDaysToAppeal: FormGroup = new FormGroup({
    days: new FormControl(10, [
      Validators.required,
      Validators.min(1),
      Validators.max(360),
    ]),
  });

  //methods

  ngOnInit() {
    this.checkForDays();
  }

  private checkForDays() {
    this.configService.getDays().subscribe((days) => {
      this.daysToAppeal = days;
      console.log(this.daysToAppeal);
    });
  }

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  onSubmit() {
    if (this.maxDaysToAppeal.valid) {
      const days = this.maxDaysToAppeal.controls['days'].value;
      console.log(days);

      //todo: el segundo parametro es el id del usuario que hay que cambiar como lo esten usando el grupo 2
      this.configService.putDays(days, 10).subscribe({
        next: (result) => {
          console.log('dias nuevos ', days);
          this.daysToAppeal = result;
          this.modalService.dismissAll();
        },
        error: (err) => {
          console.log('error al actualizar: ', err);
        },
      });
    }
  }
}
