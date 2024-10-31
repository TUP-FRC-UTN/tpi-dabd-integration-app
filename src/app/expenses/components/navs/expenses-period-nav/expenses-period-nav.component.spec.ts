import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesPeriodNavComponent } from './expenses-period-nav.component';

describe('ExpensesPeriodNavComponent', () => {
  let component: ExpensesPeriodNavComponent;
  let fixture: ComponentFixture<ExpensesPeriodNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesPeriodNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesPeriodNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
