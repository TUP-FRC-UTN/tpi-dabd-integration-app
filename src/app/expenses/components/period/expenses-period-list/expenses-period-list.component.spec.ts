import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesPeriodListComponent } from './expenses-period-list.component';

describe('ExpensesPeriodListComponent', () => {
  let component: ExpensesPeriodListComponent;
  let fixture: ComponentFixture<ExpensesPeriodListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesPeriodListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesPeriodListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
