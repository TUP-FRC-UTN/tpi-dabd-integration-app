import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketPaymentFilterButtonsComponent } from './ticket-payment-filter-buttons.component';

describe('TicketPaymentFilterButtonsComponent', () => {
  let component: TicketPaymentFilterButtonsComponent;
  let fixture: ComponentFixture<TicketPaymentFilterButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketPaymentFilterButtonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketPaymentFilterButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
