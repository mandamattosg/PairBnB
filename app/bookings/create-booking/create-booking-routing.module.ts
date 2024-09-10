import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateBookingPage } from './create-booking.page';

const routes: Routes = [
  {
    path: '',
    component: CreateBookingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateBookingPageRoutingModule {}
