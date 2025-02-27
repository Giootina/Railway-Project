import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './shared/home/home.component';
import { CheckTicketComponent } from './shared/check-ticket/check-ticket.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AvailableDeparturesComponent } from './shared/available-departures/available-departures.component';
import { BookTicketComponent } from './shared/book-ticket/book-ticket.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CheckTicketComponent,
    AvailableDeparturesComponent,
    BookTicketComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
