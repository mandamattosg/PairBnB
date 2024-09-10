import { TestBed } from '@angular/core/testing';

import { MapModalService } from './map-modal.service';

describe('MapModalService', () => {
  let service: MapModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
