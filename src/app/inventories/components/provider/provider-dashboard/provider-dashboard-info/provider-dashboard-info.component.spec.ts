import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderDashboardInfoComponent } from './provider-dashboard-info.component';

describe('ProviderDashboardInfoComponent', () => {
  let component: ProviderDashboardInfoComponent;
  let fixture: ComponentFixture<ProviderDashboardInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderDashboardInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderDashboardInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
