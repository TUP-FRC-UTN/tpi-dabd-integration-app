import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeEditModalComponent } from './employee-edit-modal.component';

describe('EmployeeEditModalComponent', () => {
  let component: EmployeeEditModalComponent;
  let fixture: ComponentFixture<EmployeeEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
