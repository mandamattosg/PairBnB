import { Injectable } from '@angular/core';
import { Place } from 'src/app/places/place.model';

@Injectable({
  providedIn: 'root'
})
export class CreateBookingService {

  mode?: 'select' | 'random';
  placeId?: Place;
  constructor() { }
}
