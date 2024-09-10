import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, take, map, tap, delay, switchMap, reduce, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';



interface PlaceData{
  availableFrom: "2022-12-14T13:36:00"
  availableTo: "2024-08-24T13:36:00"
  description: "Does this work?"  
  imageUrl: "data:image/jpeg;base64,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"
  price: 10
  title: "Test"
  userId: "aaa",
  location: PlaceLocation
}

@Injectable({
  providedIn: 'root',
})

export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);
  
  getPlace(id: string){
    return this.authService.token.pipe(take(1), switchMap(token=>{
      return this.http.get<PlaceData>(`https://courseproject-c8521-default-rtdb.firebaseio.com/offered-places/${id}.json?auth=${token}`).pipe(map(place => {
        return new Place(id, place.title, place.description, place.imageUrl, place.price, new Date(place.availableFrom), new Date(place.availableTo), place.userId, place.location);
      }));
    }))
    
  }

  get places() {
    return this._places.asObservable();
  }


  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation, imageUrl: string){
    let generatedId: string;
    let newPlace: Place;
    let fetchetUserId: string;
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      fetchetUserId = userId as string;
      return this.authService.token;
    }), take(1), switchMap(token=>{
      if(!fetchetUserId){
        throw new Error('No user found!');
      }
      newPlace = new Place(Math.random().toString(), title, description, imageUrl, price, dateFrom, dateTo, fetchetUserId, location);
      return this.http.post<{name: string}>(`https://courseproject-c8521-default-rtdb.firebaseio.com/offered-places.json?auth=${token}`, {...newPlace, id: null});
    }), switchMap(resData => {
      generatedId = resData.name;
      return  this.places;
    }), take(1), tap(places =>{
      newPlace.id = generatedId;
      this._places.next(places.concat(newPlace))
    }
    ));
    //return this.places.pipe(take(1), delay(1000),tap(places =>this._places.next(places.concat(newPlace))));
  }
  
  updateOffer(placeId: string, title: string, description: string){
    let updatedPlaces: Place[];
    let fetchedToken: string;
    return this.authService.token.pipe(take(1), switchMap(token => {
      fetchedToken = token as string;
      return this.places;
    }), take(1), switchMap(places => {
      if(!places || places.length <= 0){
        return this.fetchPlaces();
      } else{
        return of(places);
      }
  }
  ), switchMap(places => {
    const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const old = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(old.id, title, description, old.imageUrl, old.price, old.availableFrom, old.availableTo, old.userId, old.location);

  return this.http.put(`https://courseproject-c8521-default-rtdb.firebaseio.com/offered-places/${placeId}.json?auth=${fetchedToken}`, 
    {...updatedPlaces[updatedPlaceIndex], id:null}
  );
  }), tap(resData => {
    this._places.next(updatedPlaces);
  }))
  }


  uploadImage(image: File){
    const uploadData = new FormData();
    uploadData.append('image', image);
    return this.authService.token.pipe(take(1), switchMap(token=>{
      return this.http.post<{imageUrl: string, imagePath: string}>('gs://courseproject-c8521.appspot.com', uploadData, {headers: {Authorization: 'Bearer ' + token}}); //url do storage do firebase
    }))
  }

  fetchPlaces(){
    return this.authService.token.pipe(take(1), switchMap(token=>{
      return this.http.get<{[key: string]: PlaceData}>(`https://courseproject-c8521-default-rtdb.firebaseio.com/offered-places.json?auth=${token}`).pipe(map(resData => {
        const places = [];
        for (const key in resData){
          if(resData.hasOwnProperty(key)){
            places.push(new Place(key, resData[key].title, resData[key].description, resData[key].imageUrl, resData[key].price, new Date(resData[key].availableFrom), new Date(resData[key].availableTo), resData[key].userId, resData[key].location));
          }
        }
        return places;
      }), tap(places => {
        this._places.next(places);
      }));
    }));
    
  }
  constructor(public authService: AuthService, private http: HttpClient) {}
}
