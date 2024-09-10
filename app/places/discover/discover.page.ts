import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { MenuController, SegmentChangeEventDetail } from '@ionic/angular';
import { Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces?: Place[];
  subsDisc?: Subscription;
  relevantPlaces?: Place[];
  isLoading = false;
  listedLoadedPlaces?: Place[];
  constructor(private placesService: PlacesService, private authService: AuthService, private menuCtrl: MenuController) { }

  ngOnInit() {
    this.subsDisc = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter(){
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(()=>{
      this.isLoading=false;
    });
  }
  

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces?.slice(1);
      } else {
        this.relevantPlaces = this.loadedPlaces?.filter(
          place => place.userId !== userId
        );
        //console.log('relevant', this.relevantPlaces);
        this.listedLoadedPlaces = this.relevantPlaces?.slice(1);
        //console.log('relevantlisted', this.listedLoadedPlaces);
      }
    });
  }

  ngOnDestroy(){
    if(this.subsDisc){
    this.subsDisc?.unsubscribe();
    }
  }

}
