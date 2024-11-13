import { TestBed } from '@angular/core/testing';
import { StadisticsService } from './stadistics.service';


describe('StadisticsService', () => {
  let service: StadisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StadisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
