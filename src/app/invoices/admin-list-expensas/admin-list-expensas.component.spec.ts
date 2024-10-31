import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListExpensasComponent } from './admin-list-expensas.component';

describe('AdminListExpensasComponent', () => {
  let component: AdminListExpensasComponent;
  let fixture: ComponentFixture<AdminListExpensasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminListExpensasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminListExpensasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
