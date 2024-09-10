import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Place } from 'src/app/places/place.model';
import { BookingsService } from '../bookings.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { switchMap, take } from 'rxjs';
import { PlacesService } from 'src/app/places/places.service';
import { CreateBookingService } from './create-booking.service';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.page.html',
  styleUrls: ['./create-booking.page.scss'],
})
export class CreateBookingPage implements OnInit {
  @Input() selectedPlace?: Place;
  @Input() selectedMode?: 'select' | 'random';
  @ViewChild('f', {static: true}) form?: NgForm;
  startDate?: string;
  endDate?: string;
  isLoading = false;
  constructor(private loadingCtrl: LoadingController, private createBooking: CreateBookingService, private placesService: PlacesService, private authService: AuthService, private navCtrl: NavController, private bookingService: BookingsService, private route: ActivatedRoute) { }


  ngOnInit() {
    //console.log(this.createBooking.placeId);
    if(this.createBooking.placeId !== undefined){
      let fetchedUserId: string;
      this.authService.userId
      .pipe(
        take(1),
        switchMap(userId => {
          this.isLoading = true;
          if (!userId) {
            throw new Error('Found no user!');
          }
          fetchedUserId = userId;
          return this.placesService.getPlace(this.createBooking?.placeId!!.id);
        })
      ).subscribe(
        place => {
          this.selectedPlace = place;
          //console.log(place);
      this.selectedMode =  this.createBooking.mode;
      const availableFrom = new Date(this.selectedPlace?.availableFrom!!);
      const availableTo = new Date(this.selectedPlace?.availableTo!!);
        if(this.selectedMode === 'random'){
          this.startDate = new Date(
            availableFrom.getTime() +
              Math.random() *
                (availableTo.getTime() -
                  7 * 24 * 60 * 60 * 1000 -
                  availableFrom.getTime())
          ).toISOString();    
          this.endDate = new Date(
            new Date(this.startDate).getTime() +
              Math.random() *
                (new Date(this.startDate).getTime() +
                  6 * 24 * 60 * 60 * 1000 -
                  new Date(this.startDate).getTime())
          ).toISOString();
        }
        });
        this.isLoading =false;

    }else{
      this.onCancel();
    }
      
  }

  book(){
    this.loadingCtrl
            .create({ message: 'Booking place...' })
            .then(loadingEl => {
              loadingEl.present();
              this.bookingService.addBooking(
                this.selectedPlace!!.id,
                this.selectedPlace!!.title,
                this.selectedPlace!!.imageUrl,
                this.form?.value['first-name'],
                this.form?.value['last-name'],
                this.form?.value['guest-number'],
                this.form?.value['date-from'],
                this.form?.value['date-to']
              ).subscribe(()=>{
                this.createBooking.placeId = undefined;
                loadingEl.dismiss();
                this.navCtrl.navigateBack(['/bookings']);
              });
            })
   
    
  }

  datesValid(){
    const startDate = new Date(this.form?.value['date-from']);
    const endDate = new Date(this.form?.value['date-to']);
    //console.log(startDate, " // ", endDate);
    //console.log(endDate > startDate);
    return endDate > startDate; 
  }


  onCancel(){
    this.createBooking.placeId = undefined;
    this.navCtrl.navigateBack(['/places/tabs/discover/' + this.selectedPlace?.id]);
  }

}
