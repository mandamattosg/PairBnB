import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings?: Booking[];
  isLoading = false;
  subs?: Subscription;
  constructor(private bookingsService: BookingsService, private loadingCtrl: LoadingController) { }

  ngOnInit() {

    this.subs = this.bookingsService.bookings?.subscribe(bookings => {
      this.loadedBookings = bookings;
      //console.log(this.loadedBookings[0].placeImg);
    });
  }
  ionViewWillEnter(){
    this.isLoading = true;
    this.bookingsService.fetchBookings().subscribe(()=>{
      this.isLoading=false;
    });
  }

  onCancelBooking(id:string, slidingEl:IonItemSliding){
    slidingEl.close();
    this.loadingCtrl.create({ message: 'Cancelling...' }).then(loadingEl => {
      loadingEl.present();
      this.bookingsService.cancelBooking(id).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }

  ngOnDestroy(){
    if(this.subs){
      this.subs.unsubscribe();
    }
  }

}
