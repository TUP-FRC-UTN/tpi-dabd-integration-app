import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewTicketsTransferComponent } from './review-tickets-transfer.component';

describe('ReviewTicketsTransferComponent', () => {
  let component: ReviewTicketsTransferComponent;
  let fixture: ComponentFixture<ReviewTicketsTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewTicketsTransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewTicketsTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
