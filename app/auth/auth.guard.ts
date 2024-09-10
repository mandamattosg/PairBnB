import { Injectable } from '@angular/core';
import {
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	UrlTree,
	Router,
  UrlSegment,
  Route,
  CanLoad
} from '@angular/router';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})

export class AuthGuard implements CanLoad {
	constructor(private authService: AuthService, private router: Router) {}

	canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
		return this.authService.userIsAuthenticated.pipe(take(1), switchMap(isAuth=>{
			if(!isAuth){
				return this.authService.autoLogin();
			}else{
				return of(isAuth);
			}
		}),tap(isAuth => {
			if(!isAuth){
				this.router.navigate(['auth']);
			}
		}));
	}
}