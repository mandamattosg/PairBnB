import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PlacesService } from '../../places.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { PlaceLocation } from '../../location.model';
import { switchMap } from 'rxjs/operators';

function base64toBlob(base64Data: any, contentType: any){
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLenght = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLenght/sliceSize);
  const byteArrays = new Array(slicesCount);

  for(let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex){
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLenght);

    const bytes = new Array(end - begin);
    for(let offset = begin, i=0; offset < end; ++i, ++offset){
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, {type: contentType});
}

function compressImage(file: File, quality: number, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height *= maxWidth / width));
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = Math.round((width *= maxHeight / height));
          height = maxHeight;
        }
        
        // Set the canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert the canvas to a Base64 string
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}


@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {

  form?: FormGroup;
  imageString: any;
  compressed: any;

  constructor(public placesService: PlacesService, private router: Router, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo:new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      location: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null)
    });
  }

  onLocationPicked(location: PlaceLocation){
    this.form?.patchValue({location: location});
  }
  
  onImagePicker(imageData: string | File){
    
    let imageFile;
    if(typeof imageData === 'string'){
      try{
        imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64,', ''), 'image/jpeg');
      } catch(error){
        //console.log(error);
        return;
      }
    }else{
      imageFile = imageData;
     
      compressImage(imageData, 0.7, 800, 600).then((compressedBase64) => {
        //console.log('Compressed Base64 Image:', compressedBase64);
        this.compressed = compressedBase64;
        // Now you can use this compressedBase64 string to store in Firebase
      }).catch(error => {
        //console.error('Error compressing image:', error);
      });

        const reader = new FileReader();
        
        reader.onloadend = () => {
          this.imageString = reader.result as string;
          //console.log('Stored Image Data URL:', this.imageString);
          // Now you can use this.imageDataUrl in other methods
        };
        
        reader.readAsDataURL(imageFile);
      
    }
    this.form?.patchValue({image: imageFile});
  }

  onCreateOffer(){
    if(!this.form!!.valid || !this.form?.get('image')!!.value){
      return;
    }
    //console.log(this.form!!.value);
    this.loadingCtrl.create({
      message: 'Creating place...'
    }).then(loadingEl => {
      loadingEl.present();
      //console.log(this.imageString);
      this.placesService.addPlace(this.form!!.value.title, this.form!!.value.description, this.form!!.value.price, this.form!!.value.dateFrom, this.form!!.value.dateTo, this.form!!.value.location, this.compressed).subscribe(()=>{
        loadingEl.dismiss();
        this.router.navigate(['/places/tabs/offers']);
        this.form?.reset();
           
      });
      });
      
      
 
  }

}
