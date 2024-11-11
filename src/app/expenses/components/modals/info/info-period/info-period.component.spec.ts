import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoPeriodComponent } from './info-period.component';

describe('InfoPeriodComponent', () => {
  let component: InfoPeriodComponent;
  let fixture: ComponentFixture<InfoPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoPeriodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
