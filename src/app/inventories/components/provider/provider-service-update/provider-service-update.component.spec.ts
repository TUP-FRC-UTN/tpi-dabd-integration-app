import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderServiceUpdateComponent } from './provider-service-update.component';

describe('ProviderServiceUpdateComponent', () => {
  let component: ProviderServiceUpdateComponent;
  let fixture: ComponentFixture<ProviderServiceUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderServiceUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderServiceUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
