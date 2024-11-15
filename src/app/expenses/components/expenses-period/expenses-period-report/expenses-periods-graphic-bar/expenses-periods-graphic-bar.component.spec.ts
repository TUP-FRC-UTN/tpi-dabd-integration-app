import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesPeriodsGraphicBarComponent } from './expenses-periods-graphic-bar.component';

describe('ExpensesPeriodsGraphicBarComponent', () => {
  let component: ExpensesPeriodsGraphicBarComponent;
  let fixture: ComponentFixture<ExpensesPeriodsGraphicBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesPeriodsGraphicBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesPeriodsGraphicBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
