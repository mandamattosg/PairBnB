import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { map, switchMap, of } from 'rxjs';
import { Coordinates, PlaceLocation } from 'src/app/places/location.model';
import {Plugins, Capacitor} from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { MapModalService } from '../../map-modal/map-modal.service';


@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})

export class LocationPickerComponent  implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage?: string;
  isLoading = false;

  constructor(private alertCtrl: AlertController,private mapService: MapModalService, private http: HttpClient, private actionSheetCtrl: ActionSheetController, private navCtrl: NavController) { }

  ngOnInit() {}

  onPickLocation(){
    this.actionSheetCtrl.create({header: 'Please Choose', buttons: [
      {text: 'Auto-Locate', handler: ()=>{this.locateUser();}},
      {text: 'Pick on Map', handler: ()=>{this.openMap();}},
      {text: 'Cancel', role: 'cancel'}
    ]}).then(actionEl =>{
      actionEl.present();
    });

  }

  

  private locateUser(){
    if(!Capacitor.isPluginAvailable('Geolocation')){
      this.alertCtrl.create({header: 'Could not fetch location', message: 'Please use the map to choose a location.', buttons: ['Okay']}).then(alertEl => {
        alertEl.present();
      });
      return; 
    }

    this.isLoading=true;
    
      const coordinates =  Geolocation.getCurrentPosition();
      coordinates.then(res => {
        this.createPlace(res.coords.latitude, res.coords.longitude);
        this.isLoading = false;
      }).catch(() => {
      this.alertCtrl.create({header: 'Could not fetch location', message: 'Please use the map to choose a location.'});
    });

  }



  private  openMap() {
    this.navCtrl.navigateForward(['map-modal']);
    this.mapService.selectable = true;
    this.mapService.title = "Pick a location";
    this.mapService.closeButtonText = "Cancel";
    this.mapService.lastPage = "NewOffer";
    this.mapService.mapData?.subscribe(data=>{
      const coordinates: Coordinates = {
      lat: data.lat!!,
      lng: data.lng!!
    };
    this.createPlace(coordinates.lat, coordinates.lng);});
        
  }

  private createPlace(lat: number, lng: number){
    const pickedLocation : PlaceLocation = {
      lat: lat,
      lng: lng,
      address: '',
      staticMapImgUrl: ''
    };
    this.isLoading = true;
        this.getAddress(lat, lng).pipe(switchMap(address => {
          pickedLocation.address = address;
          return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
        })).subscribe(staticMapImgUrl => {
          pickedLocation.staticMapImgUrl = staticMapImgUrl;
          this.selectedLocationImage = staticMapImgUrl;
          this.isLoading = false;
          this.locationPick.emit(pickedLocation);
        });
  }

  private getAddress(lat: number, lng: number){
    return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=***`).pipe(
      map((geoData:any)=>{
        if(!geoData || !geoData.results || geoData.results.lenght <= 0){
          return null;
        }
        return geoData.results[0].formatted_address;
      })
    );
  }

  private getMapImage(lat: number, lng: number, zoom: number){
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}&key=***`;
  }
}
