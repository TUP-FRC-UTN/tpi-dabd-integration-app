import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteBillModalComponent } from './delete-bill-modal.component';

describe('DeleteBillModalComponent', () => {
  let component: DeleteBillModalComponent;
  let fixture: ComponentFixture<DeleteBillModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteBillModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteBillModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
