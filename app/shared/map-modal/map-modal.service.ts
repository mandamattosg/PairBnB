import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Coordinates } from 'src/app/places/location.model';
import { Place } from 'src/app/places/place.model';

@Injectable({
  providedIn: 'root'
})
export class MapModalService {
  mapData? = new BehaviorSubject<Coordinates>({lat: -15.7801, lng: -47.9292});
  place?: Place;
  lastPage = '';
  latitude?: number = -15.7801;
  longitude?: number = -47.9292;
  selectable = true;
  closeButtonText = 'Cancel';
  title = 'Pick Location';
  constructor() { }
}
