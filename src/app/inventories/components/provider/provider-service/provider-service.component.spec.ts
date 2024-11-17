import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderServiceComponent } from './provider-service.component';

describe('ProviderServiceComponent', () => {
  let component: ProviderServiceComponent;
  let fixture: ComponentFixture<ProviderServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
