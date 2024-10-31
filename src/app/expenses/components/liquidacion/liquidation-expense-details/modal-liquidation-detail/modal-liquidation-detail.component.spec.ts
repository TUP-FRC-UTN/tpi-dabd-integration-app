import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLiquidationDetailComponent } from './modal-liquidation-detail.component';

describe('ModalLiquidationDetailComponent', () => {
  let component: ModalLiquidationDetailComponent;
  let fixture: ComponentFixture<ModalLiquidationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalLiquidationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalLiquidationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
