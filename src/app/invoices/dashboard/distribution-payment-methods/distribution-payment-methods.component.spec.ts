import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionPaymentMethodsComponent } from './distribution-payment-methods.component';

describe('DistributionPaymentMethodsComponent', () => {
  let component: DistributionPaymentMethodsComponent;
  let fixture: ComponentFixture<DistributionPaymentMethodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributionPaymentMethodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistributionPaymentMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
