import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderListInfoComponent } from './provider-list-info.component';

describe('ProviderListInfoComponent', () => {
  let component: ProviderListInfoComponent;
  let fixture: ComponentFixture<ProviderListInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderListInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderListInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
