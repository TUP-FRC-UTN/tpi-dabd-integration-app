import { Component, inject } from '@angular/core';
import { SendVisitor } from '../../../models/visitors/visitor.model';
import { ActivatedRoute, Router } from '@angular/router';
import { VisitorService } from '../../../services/visitors/visitor.service';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-visitor-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitor-form.component.html',
})
export class VisitorFormComponent {
  visitor: SendVisitor = {
    name: '',
    last_name: '',
    doc_number: '',
    birth_date: new Date(),
    is_active: true,
  };

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly visitorService = inject(VisitorService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.visitorService.getVisitor(+id).subscribe((response) => {
        this.visitor = {
          name: response.name,
          last_name: response.last_name,
          doc_number: response.doc_number,
          is_active: response.is_active,
          birth_date: moment(response.birth_date, 'DD-MM-YYYY').toDate(),
        };
      });
    }
  }

  saveVisitor(): void {
    const formattedVisitor = {
      ...this.visitor,
      birth_date: moment(this.visitor.birth_date).format('DD-MM-YYYY'),
    };

    console.log(formattedVisitor);
    this.visitorService.upsertVisitor(formattedVisitor).subscribe(() => {
      this.router.navigate(['/qr'], {
        queryParams: {
          docNumber: this.visitor.doc_number,
          fromVisitorForm: true,
        },
      });
    });
  }
}
