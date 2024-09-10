import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {Capacitor, Plugins} from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent  implements OnInit {
  selectedImage?: string;
  usePicker = false;
  buttontitle: string = "Choose Photo";
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview = false;
  @ViewChild('filePicker') filePicker?: ElementRef<HTMLInputElement>;

  constructor(private platform: Platform) { }

  ngOnInit() {
    if((this.platform.is('mobile') &&  !this.platform.is('hybrid')) || this.platform.is('desktop')){
      this.usePicker = true;
      this.buttontitle = "Choose Photo";
    }else{
      this.buttontitle = "Take Picture";
    }
  }

  onPickImage(){
    if(!Capacitor.isPluginAvailable('Camera') || this.usePicker){
      this.filePicker?.nativeElement.click();
      return;
    }
    //console.log('onPickImage');
    const image = Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 320,
      resultType: CameraResultType.DataUrl
    });
    //console.log(image);
    image.then(image => {
      //console.log(image.webPath);
      this.selectedImage = image.webPath;
      this.imagePick.emit(image.webPath);
    }).catch(err=>{
      //console.log(err);
      if(this.usePicker){      
        this.filePicker?.nativeElement.click();
      }
    });
  }

  onFileChosen(event: Event){
    const pickedFile = (event.target as HTMLInputElement).files!![0];
    if(!pickedFile){
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result!!.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
    };
    fr.readAsDataURL(pickedFile);
  } 
}
