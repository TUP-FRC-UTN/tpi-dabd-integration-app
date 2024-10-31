import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesPeriodExpensesComponent } from './expenses-period-expenses.component';

describe('ExpensesPeriodExpensesComponent', () => {
  let component: ExpensesPeriodExpensesComponent;
  let fixture: ComponentFixture<ExpensesPeriodExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesPeriodExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesPeriodExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
