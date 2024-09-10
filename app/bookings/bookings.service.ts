import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject, take, tap, delay, switchMap, ObservableInput, map} from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImg: string;
  placeTitle: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private _bookings? = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) { }

  get bookings(){
    return this._bookings?.asObservable();
  }

  addBooking(placeId: string, placeTitle: string, placeImage: string, firstName: string, lastName: string, guestNumber: number, dateFrom: Date, dateTo: Date){
    //console.log('addBooking called');
    let generatedId: string;
    let newBooking : Booking;
    let fetchedUserId: string;
    return this.authService.userId.pipe(take(1), switchMap(userId =>{
      //console.log(userId);
      if(!userId){
        throw new Error('No user id found!');
      }
      fetchedUserId = userId;
      return this.authService.token;
    }
    ), take(1), switchMap(token => {
      newBooking = new Booking(Math.random().toString(), placeId,  fetchedUserId ,placeTitle, placeImage ,guestNumber, firstName, lastName, dateFrom, dateTo );
      //console.log(newBooking);
      return this.http.post<{name: string}>(`https://courseproject-c8521-default-rtdb.firebaseio.com/bookings.json?auth=${token}`, 
        { ...newBooking, id:null}
      )
    }), switchMap(resData => {
      //console.log(resData);
      generatedId = resData.name;
      return this.bookings!!;
    }), take(1), tap(bookings => {
      newBooking.id = generatedId;
      this._bookings?.next(bookings.concat(newBooking));
    }) ); 
  }    
    
  

  fetchBookings(){
    let fetchedUserId:string;
    return this.authService.userId.pipe(take(1), switchMap(userId=>{
      if(!userId){
        throw new Error('User not found!');
      }
      fetchedUserId = userId;
      return this.authService.token;
    }), take(1), switchMap(token=>{
      return this.http.get<{[key:string] : BookingData}>(`https://courseproject-c8521-default-rtdb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`);
    }), map(bookingData => {
      //console.log(bookingData);
        const bookings = [];
        for (const key in bookingData){
          if(bookingData.hasOwnProperty(key)){
            bookings.push(new Booking(key, bookingData[key].placeId, bookingData[key].userId, bookingData[key].placeTitle, bookingData[key].placeImg, bookingData[key].guestNumber, bookingData[key].firstName, bookingData[key].lastName, new Date(bookingData[key].bookedFrom), new Date(bookingData[key].bookedTo)))
          }
        }
        //console.log(bookings);
        return bookings;
      }),tap(bookings => {
        //console.log(bookings[0]);
        this._bookings?.next(bookings);
      })
    );
    
  }

  cancelBooking(id: string){
    return this.authService.token.pipe(take(1), switchMap(token=>{
      return this.http.delete(`https://courseproject-c8521-default-rtdb.firebaseio.com/bookings/${id}.json?auth=${token}`)
    }), switchMap(()=>{
          return this.bookings!!;
        }), take(1), tap(bookings=>{
          this._bookings?.next(bookings.filter(b => b.id !== id));
        })
      );
    }
    
  }

