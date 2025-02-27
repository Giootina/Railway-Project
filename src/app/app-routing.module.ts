import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './shared/home/home.component';
import { CheckTicketComponent } from './shared/check-ticket/check-ticket.component';
import { AvailableDeparturesComponent } from './shared/available-departures/available-departures.component';
import { BookTicketComponent } from './shared/book-ticket/book-ticket.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'check-ticket', component:CheckTicketComponent },
  { path: 'available-departures', component:AvailableDeparturesComponent },
  { path: 'book-ticket', component:BookTicketComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
