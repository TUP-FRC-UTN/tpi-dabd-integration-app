import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesChargesNavComponent } from './expenses-charges-nav.component';

describe('ExpensesChargesNavComponent', () => {
  let component: ExpensesChargesNavComponent;
  let fixture: ComponentFixture<ExpensesChargesNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesChargesNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesChargesNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
