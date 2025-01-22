import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RailwayService } from '../../services/railway.service';
import { TicketInterface } from '../../interfaces/railway.interfaces';

@Component({
  selector: 'app-check-ticket',
  templateUrl: './check-ticket.component.html',
  standalone: false,
  styleUrls: ['./check-ticket.component.css'],
})
export class CheckTicketComponent implements OnInit {
  ticketIdForm!: FormGroup;
  ticketData: TicketInterface | null = null;
  message: string = '';

  constructor(private fb: FormBuilder, private railwayService: RailwayService) {}

  ngOnInit(): void {
    this.ticketIdForm = this.fb.group({ ticketId: ['', Validators.required] });
  }
  checkTicket(): void {
    const ticketId = this.ticketIdForm.value.ticketId;
    this.railwayService.checkTicketById(ticketId).subscribe({
      next: (data: TicketInterface) => {
        this.ticketData = data;
        this.message = 'თქვენი ბილეთი წარმატებით მოიძებნა.';
      },
      error: () => {
        this.message = 'ბილეთი არ მოიძებნა!';
        this.ticketData = null;
      },
    });
    this.ticketIdForm.reset();
  }
  deleteTicket(): void {
    if (this.ticketData?.id) {
      this.railwayService.deleteTicketById(this.ticketData.id).subscribe({
        next: () => {
          this.message = `ბილეთი ID: ${this.ticketData?.id} წაშლილია წარმატებით.`;
          this.ticketData = null;
        },
        error: () => {
          this.message = 'დაფიქსირდა შეცდომა, სცადეთ თავიდან ან დაუკავშირდით ცხელ ხაზს.';
        },
      });
    } else {
      this.message = 'გთხოვთ დაადასტუროთ ბილეთი.';
    }
  }
}
