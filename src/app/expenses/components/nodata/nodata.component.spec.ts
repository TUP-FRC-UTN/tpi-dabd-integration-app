import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodataComponent } from './nodata.component';

describe('NodataComponent', () => {
  let component: NodataComponent;
  let fixture: ComponentFixture<NodataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
