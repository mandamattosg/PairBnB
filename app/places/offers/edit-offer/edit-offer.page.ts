import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../places.service';
import { NavComponent } from '@ionic/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Place } from '../../place.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  form?: FormGroup;
  place?: Place;
  isLoading = false;
  subs?: Subscription;
  constructor(private alertCtrl: AlertController, private route: ActivatedRoute, private loadingCtrl: LoadingController, private router: Router, private placesService: PlacesService, private navCtrl: NavController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')){
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.isLoading = true;
      this.subs = this.placesService.getPlace(paramMap.get('placeId')!!).subscribe(place =>{
        
        this.place = place as Place;
        
        this.form = new FormGroup({
          title: new FormControl(this.place!!.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.place!!.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(180)]
          })
        });
        this.isLoading =false;
      }, error=>{
        this.alertCtrl.create({header: 'An error ocurred!', message: 'Place could not be fetched. Please try again later.', buttons: [{text: 'Okay', handler: ()=>{
          this.router.navigate(['/places/tabs/offers']);
        }}]}).then(alertEl =>{
          alertEl.present();
        });
      }
      );
      
    });
    
  }

 
  onEditOffer(){
    if(!this.form!!.valid){
      return;
    }
    this.loadingCtrl.create({
      message: 'Updating place...'
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService.updateOffer(this.place?.id!!, this.form?.value.title, this.form?.value.description).subscribe( () =>{
        loadingEl.dismiss();
        this.form?.reset();
        this.router.navigate(['/places/tabs/offers']);
      }
    )
  }

    );
    //console.log(this.form);
  }

  ngOnDestroy(){
    if(this.subs){
      this.subs.unsubscribe();
    }
  }

}
