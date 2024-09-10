import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateBookingPage } from './create-booking.page';

describe('CreateBookingPage', () => {
  let component: CreateBookingPage;
  let fixture: ComponentFixture<CreateBookingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBookingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
