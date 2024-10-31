import { Component } from '@angular/core';
import { QrService } from '../../../services/qr/qr.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './qr-form.component.html',
})
export class QrFormComponent {
  docNumber: number = 0;
  qrImageSrc: string = '';
  fromVisitorForm: boolean = false;

  constructor(private qrService: QrService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['docNumber']) {
        this.docNumber = +params['docNumber'];
        this.generateQr();
      }

      if (params['fromVisitorForm']) {
        this.fromVisitorForm = params['fromVisitorForm'] === 'true';
      }
    });
  }

  generateQr() {
    this.qrService.getQr(this.docNumber).subscribe((response) => {
      const reader = new FileReader();
      reader.readAsDataURL(response);
      reader.onloadend = () => {
        this.qrImageSrc = reader.result as string;
      };
    });
  }
}
