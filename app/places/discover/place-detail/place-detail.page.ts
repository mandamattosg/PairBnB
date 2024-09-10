import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { AuthService } from '../../../auth/auth.service';
import { BookingsService } from 'src/app/bookings/bookings.service';
import { CreateBookingService } from 'src/app/bookings/create-booking/create-booking.service';
import { MapModalService } from 'src/app/shared/map-modal/map-modal.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss']
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place?: Place;
  isBookable = false;
  isLoading = false;
  placeSub?: Subscription;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingsService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router,
    private createBooking: CreateBookingService,
    private mapService: MapModalService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId
        .pipe(
          take(1),
          switchMap(userId => {
            if (!userId) {
              throw new Error('Found no user!');
            }
            fetchedUserId = userId;
            return this.placesService.getPlace(paramMap.get('placeId')!!);
          })
        )
        .subscribe(
          place => {
            this.place = place;
            this.isBookable = place.userId !== fetchedUserId;
            this.isLoading = false;
          },
          error => {
            this.alertCtrl
              .create({
                header: 'An error ocurred!',
                message: 'Could not load place.',
                buttons: [
                  {
                    text: 'Okay',
                    handler: () => {
                      this.router.navigate(['/places/tabs/discover']);
                    }
                  }
                ]
              })
              .then(alertEl => alertEl.present());
          }
        );
    });
  }


  
  onBookPlace() {
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navCtrl.navigateBack('/places/tabs/discover');
    // this.navCtrl.pop();
    this.actionSheetCtrl
      .create({
        header: 'Choose an Action',
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookPage('select');
            }
          },
          {
            text: 'Random Date',
            handler: () => {
              this.openBookPage('random');
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      })
      .then(actionSheetEl => {
        actionSheetEl.present();
      });
  }

  openBookPage(mode: 'select' | 'random') {
    this.createBooking.mode = mode;
    this.createBooking.placeId = this.place;
    this.router.navigate(['/bookings/create-booking']);
  }
  

  onShowFullMap() {
    this.mapService.place = this.place;
    this.navCtrl.navigateForward(['map-modal'])
    this.mapService.latitude = this.place!!.location.lat;
    this.mapService.longitude = this.place!!.location.lng;
    this.mapService.selectable = false;
    this.mapService.closeButtonText = 'Close';
    this.mapService.lastPage = 'PageDetail';
    this.mapService.title = this.place!!.location.address;
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
