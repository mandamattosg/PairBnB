import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { MapModalService } from './map-modal.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.page.html',
  styleUrls: ['./map-modal.page.scss'],
})
export class MapModalPage implements OnInit, AfterViewInit{
  constructor(private location: Location, private renderer: Renderer2, private mapService: MapModalService, private navCtrl: NavController) { }

  @ViewChild('map', { static: false }) mapElement?: ElementRef;
  clickListener?: any;
  googleMaps: any;
   center = {lat: this.mapService.latitude, lng: this.mapService.longitude};
   selectable = this.mapService.selectable;
   closeButtonText = this.mapService.closeButtonText;
   title = this.mapService.title;
  

  ngOnInit() {
    if(this.clickListener){
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }

  ngAfterViewInit() {
    //console.log('selectable 1: ', this.selectable);
    if(this.mapService.lastPage === 'PageDetail'){
      if(this.mapService.place === undefined ){
        this.onCancel();
      }
    } 
    
    this.getGoogleMaps().then(googleMaps => {
      //console.log('selectable: ', this.selectable);

      this.googleMaps = googleMaps;
      const mapEl = this.mapElement!!.nativeElement;
      const map = new googleMaps.Map(mapEl, {
        center: this.center,
        zoom: 16
      });
      this.googleMaps.event.addListenerOnce(map, 'idle', ()=>{
        this.renderer.addClass(mapEl, 'visible');
      });

      if(this.selectable){
        //console.log('selectable true');
        this.clickListener = map.addListener('click', (event: { latLng: { lat: () => any; lng: () => any; }; }) => {
          const selectedCoords = {lat: event.latLng.lat(), lng: event.latLng.lng()};
          this.mapService.mapData?.next(selectedCoords);
          this.location.back();
        });
      }else{
        const marker = new googleMaps.Marker({
          position: this.center,
          map: map,
          title: 'Picked Location'
        });
        marker.setMap(map);
      }
      

    }).catch(err => {
      //console.log(err);
    });
  
  }

  private getGoogleMaps() : Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if(googleModule && googleModule.maps){
      return Promise.resolve(googleModule.maps);
    } 
    return new Promise((resolve, reject)=> {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=***'
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogle = win.google;
        if(loadedGoogle && loadedGoogle.maps){
          resolve(loadedGoogle.maps);
        }else{
          reject('Google Maps SDK not available');
        }
      }    
    })
  }

  onCancel(){
    if(this.mapService.lastPage === 'PageDetail'){
      this.navCtrl.navigateBack(['places/tabs/discover/' + this.mapService.place?.id])
      this.mapService.latitude = -15.7801;
      this.mapService.longitude = -47.9292;
    } else if(this.mapService.lastPage === 'NewOffer'){
      this.navCtrl.navigateBack(['places/tabs/offers/new-offer'])
    } else{
      this.navCtrl.navigateBack(['places/tabs/discover/'])
    }
    this.mapService.place = undefined;
  }


}
