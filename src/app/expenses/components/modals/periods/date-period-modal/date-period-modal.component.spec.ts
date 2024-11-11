import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePeriodModalComponent } from './date-period-modal.component';

describe('DatePeriodModalComponent', () => {
  let component: DatePeriodModalComponent;
  let fixture: ComponentFixture<DatePeriodModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePeriodModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatePeriodModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
