import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  loadedPlaces?: Place[];
  isLoading = false;
  relevantPlaces?: Place[];
  subsOffers?: Subscription;
  constructor(private placesService: PlacesService, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.subsOffers = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.authService.userId.pipe(take(1)).subscribe(userId => {
        this.relevantPlaces = this.loadedPlaces?.filter(
          place => place.userId === userId
        );
        //console.log(this.relevantPlaces);
        //this.loadedPlaces = this.relevantPlaces;
        //console.log(this.loadedPlaces);
      });
    });
    
    
  }

  ionViewWillEnter(){
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      this.relevantPlaces = this.loadedPlaces?.filter(
        place => place.userId === userId
      );
      //console.log(this.relevantPlaces);
      //this.loadedPlaces = this.relevantPlaces;
      //console.log(this.loadedPlaces);
    });
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }
  

  onEdit(offerId: string, slidingItem: IonItemSliding){
    slidingItem.close();
    this.router.navigate(['/', 'places','tabs','offers','edit', offerId]);
    //console.log('editing item');
  }

  ngOnDestroy(){
    if(this.subsOffers){
    this.subsOffers?.unsubscribe();
    }
  }

}
