import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvideConfigComponent } from './provide-config.component';

describe('ProvideConfigComponent', () => {
  let component: ProvideConfigComponent;
  let fixture: ComponentFixture<ProvideConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvideConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvideConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
