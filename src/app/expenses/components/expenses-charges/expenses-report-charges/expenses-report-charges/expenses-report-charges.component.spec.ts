import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesReportChargesComponent } from './expenses-report-charges.component';

describe('ExpensesReportChargesComponent', () => {
  let component: ExpensesReportChargesComponent;
  let fixture: ComponentFixture<ExpensesReportChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesReportChargesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesReportChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
