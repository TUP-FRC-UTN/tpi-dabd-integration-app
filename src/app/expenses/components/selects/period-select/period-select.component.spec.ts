import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodSelectComponent } from './period-select.component';

describe('PeriodSelectComponent', () => {
  let component: PeriodSelectComponent;
  let fixture: ComponentFixture<PeriodSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
