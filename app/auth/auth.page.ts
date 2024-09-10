import { Component, OnInit } from '@angular/core';
import { AuthResData, AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  constructor(private authService: AuthService, private router: Router, private loadingCtrl: LoadingController, private alertCtrl: AlertController) { }

  isLoading = false;
  isLogin = true;

  ngOnInit() {
  }

  authenticate(email: string, password: string){
   
  this.isLoading=true; 
  this.loadingCtrl.create({
    keyboardClose: true,
    message: "Logging in..."
  }).then(loadingEl =>{
    loadingEl.present();
    let authObs: Observable<AuthResData>;
    if(this.isLogin){
      authObs = this.authService.login(email, password);
    } else{
      authObs = this.authService.signup(email, password);
    }
    authObs.subscribe(res=>{
      //console.log(res);
      this.isLoading=false;
      loadingEl.dismiss();
      this.router.navigateByUrl('/places/tabs/discover');
    }, error =>{
      loadingEl.dismiss();
      const code = error.error.error.message;
      //console.log(code);
      let message = 'Could not sign you up! Please try again';
      if(code === "EMAIL_EXISTS"){
        message = 'This email address already exists!';
      } else if(code === "INVALID_LOGIN_CREDENTIALS"){
        message = 'Email or password incorrect!';
      } 
      this.showAlert(message);
    });
    
  });
  
  }

  onSubmit(f: NgForm){
    if(!f.valid){
      return;
    }
    const email = f.value.email;
    const password = f.value.password;

    this.authenticate(email, password);

    f.reset();
  }

  onSwitch(){
    this.isLogin = !this.isLogin;
  }

  showAlert(message: string){
    this.alertCtrl.create({header:  'Authentication failed', message: message, buttons: ['Okay']}).then(alertEl => {
      alertEl.present();
    })
  }
}
