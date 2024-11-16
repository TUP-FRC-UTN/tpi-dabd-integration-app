import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesCategoryGraphicComponent } from './expenses-category-graphic.component';

describe('ExpensesSupplierGraphicComponent', () => {
  let component: ExpensesCategoryGraphicComponent;
  let fixture: ComponentFixture<ExpensesCategoryGraphicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesCategoryGraphicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesCategoryGraphicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
