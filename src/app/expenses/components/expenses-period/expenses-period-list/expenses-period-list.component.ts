import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { PeriodService } from '../../../services/period.service';
import Period from '../../../models/period';
import { DatePipe, NgClass } from '@angular/common';
import { ExpensesModalComponent } from '../../modals/expenses-modal/expenses-modal.component';
import {
  NgbActiveModal,
  NgbModal,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgModalComponent } from '../../modals/ng-modal/ng-modal.component';
import { generateNumberArray } from '../../../utils/generateArrayNumber';
import { ExpensesStatePeriodStyleComponent } from '../expenses-state-period-style/expenses-state-period-style.component';
import { FormsModule } from '@angular/forms';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import {
  ToastService,
  ConfirmAlertComponent,
  FilterConfigBuilder,
  MainContainerComponent,
  TableFiltersComponent,
  Filter,
  TableComponent,
} from 'ngx-dabd-grupo01';
import * as XLSX from 'xlsx';
import { NgPipesModule } from 'ngx-pipes';
import moment from 'moment';
import { InfoModalComponent } from '../../modals/info-modal/info-modal.component';
import { RouterModule } from '@angular/router';
import { LiquidationExpenseService } from '../../../services/liquidation-expense.service';
import { forkJoin, mergeMap } from 'rxjs';
import { ExpenseServiceService } from '../../../services/expense.service';
import { DatePeriodModalComponent } from '../../modals/periods/date-period-modal/date-period-modal.component';
import { InfoPeriodComponent } from '../../modals/info/info-period/info-period.component';
import { User } from '../../../models/user';
import { StorageService } from '../../../services/storage.service';
import { URLTargetType } from '../../../../users/models/role';

@Component({
  selector: 'app-expenses-period-list',
  standalone: true,
  imports: [
    ExpensesStatePeriodStyleComponent,
    NgClass,
    ConfirmAlertComponent,
    ExpensesModalComponent,
    NgModalComponent,
    NgbModule,
    NgPipesModule,
    FormsModule,
    InfoModalComponent,
    TableFiltersComponent,
    MainContainerComponent,
    RouterModule,
    TableComponent,
  ],
  providers: [DatePipe, NgbActiveModal, NgbModule, NgbModal],
  templateUrl: './expenses-period-list.component.html',
  styleUrls: ['./expenses-period-list.component.css'],
})
export class ExpensesPeriodListComponent implements OnInit {
  private readonly periodService: PeriodService = inject(PeriodService);
  private modalService = inject(NgbModal);
  toastService: ToastService = inject(ToastService);
  private readonly liquidationService: LiquidationExpenseService = inject(
    LiquidationExpenseService
  );
  private readonly expensesService: ExpenseServiceService = inject(
    ExpenseServiceService
  );
  private storage = inject(StorageService);

  rolCode: boolean= false;

  listOpenPeriod: Period[] = [];
  listPeriod: Period[] = [];
  cantPages: number[] = [];
  indexActive = 1;
  size = 10;
  idClosePeriod: number | null = null;
  private state: string | null = null;
  currentPage: number = 1;
  typeFilter: string | null = null;
  year: number | null = null;
  month: number | null = null;

  ngOnInit(): void {
    let user = this.storage.getFromSessionStorage('user') as User;
    
    this.rolCode = user.value.roles.filter(rol => rol.code === URLTargetType.FINANCE).length == 1 ? true : false
    this.loadPaged(1);
  }
  searchTerm = '';

  filterConfig: Filter[] = new FilterConfigBuilder()
    .numberFilter('Año', 'year', 'Seleccione un año')
    .selectFilter('Mes', 'month', 'Seleccione un mes', [
      { value: '1', label: 'Enero' },
      { value: '2', label: 'Febrero' },
      { value: '3', label: 'Marzo' },
      { value: '4', label: 'Abril' },
      { value: '5', label: 'Mayo' },
      { value: '6', label: 'Junio' },
      { value: '7', label: 'Julio' },
      { value: '8', label: 'Agosto' },
      { value: '9', label: 'Septiembre' },
      { value: '10', label: 'Octubre' },
      { value: '11', label: 'Noviembre' },
      { value: '12', label: 'Diciembre' },
    ])
    .radioFilter('Activo', 'estate', [
      { value: 'OPEN', label: 'Activos' },
      { value: 'CLOSE', label: 'Finalizados' },
      { value: 'null', label: 'Todo' },
    ])
    .build();

  fileName = 'reporte-periodos-liquidaciones';

  showModal():void {
    this.modalService.open(InfoPeriodComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true,
    });
  }

  loadPaged(page: number) {
    page = page - 1;
    console.log(this.size, page, this.state, this.month, this.year);
    this.periodService
      .getPage(this.size, page, this.state, this.month, this.year)
      .subscribe((data) => {
        this.listPeriod = data.content;
        const listPeriodOpen = data.content.filter(
          (p) => p.state == 'Obsoleto' || p.state == 'Abierto'
        );
        if (listPeriodOpen.length > 0) {
          const liquidationRequests = listPeriodOpen.map((p) =>
            this.liquidationService
              .get(p.id)
              .pipe(mergeMap(() => this.expensesService.getByPeriod(p.id)))
          );

          forkJoin(liquidationRequests).subscribe(() => {
            this.periodService
              .getPage(this.size, page, this.state, this.month, this.year)
              .subscribe((newData) => {
                this.listPeriod = newData.content;
                this.cantPages = generateNumberArray(newData.totalPages);
              });
          });
        }
        this.cantPages = generateNumberArray(data.totalPages);
      });
  }

  onSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.size = Number(selectElement.value);
    this.loadPaged(this.indexActive);
  }

  open(id: number | null) {
    this.idClosePeriod = id;
    const modalRef = this.modalService.open(ConfirmAlertComponent);

    modalRef.componentInstance.alertMessage =
      'Al cerrar el periodo no podrá cargar mas gastos ni cargos al mismo, se cerrará el cálculo y enviará a tickets la información para procesarla. ¿Está seguro que desea continuar?';
    modalRef.componentInstance.alertType = 'danger';
    modalRef.result.then((result) => {
      console.log(result);
      if (result) {
        this.closePeriod();
        this.loadPaged(this.currentPage);
      }
    });
  }
  openLiquidationClose(id: number | null) {
    this.idClosePeriod = id;
    const modalRef = this.modalService.open(ConfirmAlertComponent);

    modalRef.componentInstance.alertMessage =
      'Al cerrar la liquidación inhabilitara la posibilidad de añadir nuevos gastos al periodo. ¿Desea continuar?';
    modalRef.componentInstance.alertType = 'warning';
    modalRef.result.then((result) => {
      console.log(result);
      if (result && this.idClosePeriod) {
        this.liquidationService
          .putCloseLiquidationExpensesPeriod(this.idClosePeriod)
          .subscribe(() => {
            this.idClosePeriod = null;
            this.loadPaged(this.currentPage);
          });
      }
    });
  }
  openLiquidationOpen(id: number | null) {
    this.idClosePeriod = id;
    const modalRef = this.modalService.open(ConfirmAlertComponent);

    modalRef.componentInstance.alertMessage =
      'Al abrir la liquidación habilitara nuevamente la posibilidad de añadir nuevos gastos al periodo. ¿Desea continuar?';
    modalRef.componentInstance.alertType = 'warning';
    modalRef.result.then((result) => {
      console.log(result);
      if (result && this.idClosePeriod) {
        this.liquidationService
          .putCloseLiquidationExpensesPeriod(this.idClosePeriod)
          .subscribe(() => {
            this.idClosePeriod = null;
            this.loadPaged(this.currentPage);
          });
      }
    });
  }

  changeIndex(cant: number) {
    this.indexActive = cant;
    this.loadPaged(cant);
  }

  changeStateQuery = (text: string | null) => {
    this.state = text;
    this.loadPaged(this.indexActive);
  };

  newPeriod(id: number | null, date: string | null) {
    if (id == null) {
      this.periodService.getFuture().subscribe(
        next => {
          const modalRef = this.modalService.open(DatePeriodModalComponent)
          modalRef.componentInstance.id = id;
          modalRef.componentInstance.nextDate = next.period;
        },
        error => {
          if (error) {
            console.log(error);

            this.toastService.sendError(error.error.message);
          } else {
            this.toastService.sendError('Ocurrio un error');
          }
        }
      )
    } else {
      if(date !== null) {
        const modalRef = this.modalService.open(DatePeriodModalComponent)
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.nextDate = date;
      }
    }

  }
  openErrorModal(err: any) {
    const modalRef = this.modalService.open(NgModalComponent);
    modalRef.componentInstance.title = 'Error';
    modalRef.componentInstance.message = err?.error.message;
  }

  closePeriod() {
    if (this.idClosePeriod) {
      this.periodService.closePeriod(this.idClosePeriod).subscribe({
        next: (data) => {
          this.idClosePeriod = null;
          console.log('Period closed successfully');
        },
        error: (err) => {
          console.log(err);
          if (err) {
            this.toastService.sendError(err.error.message);
          } else {
            this.toastService.sendError('Ocurrio un error');
          }
        },
      });

      this.idClosePeriod = null;
    }
  }

  filterChange($event: Record<string, any>) {
    const { year, month, estate } = $event; // this.year = null;
    this.year = year;
    this.month = month;
    estate === 'null' ? (this.state = null) : (this.state = estate);

    this.loadPaged(this.currentPage);
  }

  downloadTable() {
    this.periodService
      .getPage(500000, 0, this.state, this.month, this.year)
      .subscribe((period) => {
        // Mapear los datos a un formato tabular adecuado
        const data = period.content.map((peri) => ({
          Fecha: `${peri.month + ' / ' + peri.year}`,
          'Total Extraordinarias': `${
            peri.ordinary?.amount?.toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || 0
          }`,
          'Total Ordinarias': `${
            peri.extraordinary?.amount?.toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || 0
          }`,
          Estado: `${peri.state}`,
        }));

        // Convertir los datos tabulares a una hoja de cálculo
        const fecha = new Date();
        console.log(fecha);
        const finalFileName =
          this.fileName + '-' + moment(fecha).format('DD-MM-YYYY_HH-mm');

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Periodos de Liquidación');
        XLSX.writeFile(wb, `${finalFileName}.xlsx`);
      });
  }

  imprimir() {
    console.log('Imprimiendo');
    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(18);
    doc.text('Reporte de Periodos de Liquidación', 14, 20);

    // Llamada al servicio para obtener las expensas
    this.periodService
      .getPage(500000, 0, this.state, this.month, this.year)
      .subscribe((period) => {
        // Usando autoTable para agregar la tabla
        autoTable(doc, {
          startY: 30,
          head: [
            ['Fecha', 'Total Extraordinarias', 'Total Ordinarias', 'Estado'],
          ],
          body: period.content.map((peri) => [
            peri.month + ' / ' + peri.year,
            peri.ordinary?.amount?.toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || 0,
            peri.extraordinary?.amount?.toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || 0,
            peri.state,
          ]),
        });
        // Guardar el PDF después de agregar la tabla
        const fecha = new Date();
        console.log(fecha);
        const finalFileName =
          this.fileName +
          '-' +
          moment(fecha).format('DD-MM-YYYY_HH-mm') +
          '.pdf';
        doc.save(finalFileName);
        console.log('Impreso');
      });
  }
}
