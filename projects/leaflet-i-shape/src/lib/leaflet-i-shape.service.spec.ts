import { TestBed } from '@angular/core/testing';

import { LeafletIShapeService } from './leaflet-i-shape.service';

describe('LeafletIShapeService', () => {
  let service: LeafletIShapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeafletIShapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
