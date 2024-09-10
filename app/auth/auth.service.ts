import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, from, map, tap } from 'rxjs';
import { User } from './user.model';
import { Preferences } from '@capacitor/preferences';

export interface AuthResData{
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User | null>(null);
  private activeLogoutTimer: any;
  get userIsAuthenticated(){
    return this._user.asObservable().pipe(map(user=> {
      if(user){
        return !!user.token;
      } else{
        return false;
      }
    }));
  }

  ngOnDestroy(): void {
    if(this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer);
    }
  }
  constructor(private http: HttpClient) { }

  get token(){
    return this._user.asObservable().pipe(map(user => {
      if(user){
        return user.token;
      }else{
        return null;
      }
      }));
  }

  private autoLogout(duration: number){
    if(this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(()=>{
      this.logout();
    }, duration);
  }
  autoLogin(){
    return from(Preferences.get({ key: 'authData' })).pipe(map(storedData=>{
      if(!storedData || !storedData.value){
        return null;
      }
      const parsedData = JSON.parse(storedData.value) as {token: string; tokenExpirationDate: string; userId: string, email: string};
      const expirationTime = new Date(parsedData.tokenExpirationDate);
      if(expirationTime <= new Date()){
        return null;
      }
      const user = new User(parsedData.userId, parsedData.email, parsedData.token, expirationTime);
      return user;
    }), tap(user => {
      if(user){
        this._user.next(user);
        this.autoLogout(user.tokenDuration);
      }

    }), map(user => {
      return !!user;
    }));
  }

  login(email: string, password: string){
    return this.http.post<AuthResData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=***', {email: email, password: password, returnSecureToken: true} ).pipe(tap(this.setUserData.bind(this)));
  }
  logout(){
    if(this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Preferences.remove({key: 'authData'});
  }
  get userId(){
    return this._user.asObservable().pipe(map(user => {
    if(user){
      return user.id;
    }else{
      return null;
    }
    }));
  }
  signup(email: string, password: string){
    return this.http.post<AuthResData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=***', {email: email, password: password, returnSecureToken: true}).pipe(tap(
     this.setUserData.bind(this)
    ));
  }

  private setUserData(res: AuthResData){
    const expirationTime = new Date(new Date().getTime() + (+res.expiresIn * 1000));
    const user = new User(res.localId, res.email, res.idToken, expirationTime);
      this._user.next(user);
      this.autoLogout(user.tokenDuration);
      this.storeAuthData(res.localId, res.idToken, expirationTime.toISOString(), res.email);
  }
  
  private storeAuthData(userId: string, token: string, tokenExpirationDate: string, email: string){
    const data = JSON.stringify({userId: userId, token: token, tokenExpirationDate: tokenExpirationDate, email: email});
    Preferences.set({
        key: 'authData',
        value: data
      });
    
  }

}
