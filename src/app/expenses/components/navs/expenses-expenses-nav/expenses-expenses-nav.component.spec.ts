import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesExpensesNavComponent } from './expenses-expenses-nav.component';

describe('ExpensesExpensesNavComponent', () => {
  let component: ExpensesExpensesNavComponent;
  let fixture: ComponentFixture<ExpensesExpensesNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesExpensesNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesExpensesNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
