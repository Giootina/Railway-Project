import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RailwayService } from '../../services/railway.service';
import { TicketInterface } from '../../interfaces/railway.interfaces';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

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

  constructor(private router: ActivatedRoute, private fb: FormBuilder, private railwayService: RailwayService) {}

  ngOnInit(): void {
    this.ticketIdForm = this.fb.group({
      ticketId: ['',[Validators.required,Validators.pattern(/^[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}$/)]]});
    this.router.queryParams.subscribe((params: { [x: string]: string }) => {
      const ticketId = params['ticketId'];
      if (ticketId) {
        this.loadTicket(ticketId);
      }
    });
  }
  loadTicket(ticketId: string): void {
    this.railwayService.checkTicketById(ticketId).subscribe({
      next: (data: TicketInterface) => {
        this.ticketData = data;
        this.ticketData.persons.forEach((passenger) => {
          passenger.stampRotationDegrees = Math.random() * 360;
        });
      },
      error: () => {
        this.message = 'ბილეთი არ მოიძებნა!';
        this.ticketData = null;
      },
    });
  }
  formatTicketId(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      let value = target.value;
      const unformatted = value.replace(/-/g, '');
      let formattedId = '';
      if (unformatted.length > 0) {
        formattedId = unformatted.substring(0, 8);
        if (unformatted.length > 8) {
          formattedId += '-' + unformatted.substring(8, 12);
          if (unformatted.length > 12) {
            formattedId += '-' + unformatted.substring(12, 16);
            if (unformatted.length > 16) {
              formattedId += '-' + unformatted.substring(16, 20);
              if (unformatted.length > 20) {
                formattedId += '-' + unformatted.substring(20);
              }
            }
          }
        }
      }
      target.value = formattedId;
    }
  }
  checkTicket(): void {
    const ticketId = this.ticketIdForm.value.ticketId;
    this.loadTicket(ticketId);
    this.ticketIdForm.reset();
  }
  deleteTicket(): void {
    if (!this.ticketData || !this.ticketData.id) return;
    Swal.fire({
      title: 'გსურთ ბილეთის წაშლა?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'დიახ',
      cancelButtonText: 'არა',
    }).then((result) => {
      if (result.isConfirmed) {
        this.railwayService.deleteTicketById(this.ticketData!.id).subscribe({
          next: () => {
            Swal.fire({
              title: 'წაშლილია!',
              text: `ბილეთი წაშლილია წარმატებით.`,
              icon: 'success',
              confirmButtonText: 'დახურვა',
              timer: 5000,
            });
            this.ticketData = null;
          },
          error: () => {
            Swal.fire({
              title: 'შეცდომა',
              text: 'ბილეთის წაშლისას მოხდა შეცდომა',
              icon: 'error',
              confirmButtonText: 'დახურვა',
              timer: 5000,
            });
          },
        });
      }
    });
  }
}
