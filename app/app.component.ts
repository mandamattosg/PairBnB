import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import {Capacitor, Plugins} from '@capacitor/core';
import { Subscription, take } from 'rxjs';
import { App, AppState } from '@capacitor/app';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy{
  private subs?: Subscription;
  private preveousAuthState=false;
  constructor(private authService: AuthService, private router: Router, private platform: Platform) {
    this.initializeApp();
  }

  ngOnInit(): void {
    this.subs = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if(!isAuth && this.preveousAuthState !== isAuth){
        this.router.navigateByUrl('/auth');
      }
      this.preveousAuthState = isAuth;
    });

    App.addListener('appStateChange', this.checkAuthOnResume.bind(this));
  
  }

  ngOnDestroy(){
    if(this.subs){
      this.subs.unsubscribe();
    }
  }
  onLogout(){
    this.authService.logout();
  }
  initializeApp(){
    this.platform.ready().then(()=>{
      if(Capacitor.isPluginAvailable('SplashScreen')){
        Plugins['SplashScreen']['hide']();
      }
    });
  }

  private checkAuthOnResume(state: AppState){
    if(state.isActive){
      this.authService.autoLogin().pipe(take(1)).subscribe(success=>{
        if(!success){
          this.onLogout();
        }
      });
    }
  }

  
}
