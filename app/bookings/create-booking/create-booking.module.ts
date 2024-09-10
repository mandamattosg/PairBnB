import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateBookingPageRoutingModule } from './create-booking-routing.module';

import { CreateBookingPage } from './create-booking.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateBookingPageRoutingModule
  ],
  declarations: [CreateBookingPage]
})
export class CreateBookingPageModule {}
