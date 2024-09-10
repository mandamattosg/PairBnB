import { TestBed } from '@angular/core/testing';

import { CreateBookingService } from './create-booking.service';

describe('CreateBookingService', () => {
  let service: CreateBookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateBookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
