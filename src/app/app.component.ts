import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.css']})
export class AppComponent { 
  constructor(private router: Router) {}
  
  pageReloader(): void {
    this.router.navigate(['check-ticket']).then(() => {
      window.location.reload();
    });
  }
}
