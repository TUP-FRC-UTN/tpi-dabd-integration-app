import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryChargeInfoComponent } from './category-charge-info.component';

describe('CategoryChargeInfoComponent', () => {
  let component: CategoryChargeInfoComponent;
  let fixture: ComponentFixture<CategoryChargeInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryChargeInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryChargeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
