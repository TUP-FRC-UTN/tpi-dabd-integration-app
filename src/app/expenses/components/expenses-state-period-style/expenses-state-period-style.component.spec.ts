import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesStatePeriodStyleComponent } from './expenses-state-period-style.component';

describe('ExpensesStatePeriodStyleComponent', () => {
  let component: ExpensesStatePeriodStyleComponent;
  let fixture: ComponentFixture<ExpensesStatePeriodStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesStatePeriodStyleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesStatePeriodStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
