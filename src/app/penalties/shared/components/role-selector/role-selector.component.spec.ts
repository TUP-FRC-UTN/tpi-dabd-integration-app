import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleSelectorComponent } from './role-selector.component';

describe('RoleSelectorComponent', () => {
  let component: RoleSelectorComponent;
  let fixture: ComponentFixture<RoleSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
