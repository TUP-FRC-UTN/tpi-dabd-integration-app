import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerListExpensasComponent } from './owner-list-expensas.component';

describe('OwnerListExpensasComponent', () => {
  let component: OwnerListExpensasComponent;
  let fixture: ComponentFixture<OwnerListExpensasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerListExpensasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerListExpensasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
