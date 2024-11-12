import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalPaymentsComponent } from './total-payments.component';

describe('TotalPaymentsComponent', () => {
  let component: TotalPaymentsComponent;
  let fixture: ComponentFixture<TotalPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalPaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
