import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeListInfoComponent } from './employee-list-info.component';

describe('EmployeeListInfoComponent', () => {
  let component: EmployeeListInfoComponent;
  let fixture: ComponentFixture<EmployeeListInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeListInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeListInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
