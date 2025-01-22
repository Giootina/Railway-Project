import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RailwayService } from '../../services/railway.service';
import { PassengerInterface, TicketInterface, TrainInterface } from '../../interfaces/railway.interfaces';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  standalone: false,
  styleUrls: ['./ticket-form.component.css'],
})
export class TicketFormComponent implements OnInit {
  ticketId: string | null = null;
  ticketData: TicketInterface | null = null;
  totalPrice: number = 0;

  constructor(private route: ActivatedRoute, private railwayService: RailwayService, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const ticketId = params['ticketId'];
      if (ticketId) {
        this.railwayService.checkTicketById(ticketId).subscribe({
          next: (data: TicketInterface) => {
            this.ticketData = data;
            this.calculateTotalPrice();
          },
          error: (error) => {
            console.error('Error fetching ticket data:', error);
          },
        });
      }
    });
  }
  loadTicketData(ticketId: string): void {
    this.railwayService.checkTicketById(ticketId).subscribe({
      next: (data: TicketInterface) => {
        this.ticketData = data;
        this.calculateTotalPrice();
      },
      error: (error) => {
        console.error('Error fetching ticket data:', error);
      },
    });
  }
  calculateTotalPrice(): void {
    if (this.ticketData?.persons) {
      this.totalPrice = this.ticketData.persons.reduce(
        (total, passenger) => total + (passenger.seat.price || 0),
        0
      );
    }
  }
  deleteTicket(): void {
    if (this.ticketData?.id) {
      this.railwayService.deleteTicketById(this.ticketData.id).subscribe({
        next: () => {
          alert(`ბილეთი დაბრუნდა წარმატებით!`);
          this.router.navigate(['/']);
        },
        error: () => {
          alert('დაფიქსირდა შეცდომა, სცადეთ თავიდან ან დაუკავშირდით ცხელ ხაზს');
        },
      });
    }
  }
}
