import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RailwayService } from '../../services/railway.service';
import { DepartureInterface, PassengerInterface, RequestBodyInterface, SeatInterface, TrainInterface, VagonInterface } from '../../interfaces/railway.interfaces';

@Component({
  selector: 'app-book-ticket',
  templateUrl: './book-ticket.component.html',
  standalone: false,
  styleUrls: ['./book-ticket.component.css'],
})
export class BookTicketComponent implements OnInit {
  bookForm!: FormGroup;
  paymentForm!: FormGroup;
  trainDetails: TrainInterface | null = null;
  passengersCount: number = 0;
  vagons: VagonInterface[] = [];
  selectedPassengerIndex: number | null = null;
  selectedSeats: SeatInterface[] = [];
  showSeatPopup: boolean = false;
  showPaymentPopup: boolean = false;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private railwayService: RailwayService, private router: Router) {}

  ngOnInit(): void {
    this.bookForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
      passengers: this.fb.array([]),
      termsAccepted: [false, Validators.requiredTrue],
    });
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      cardHolder: ['', Validators.required],
      expireDate: ['', Validators.required],
      cv2: ['', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]],
    });
    this.passengersCount = this.railwayService.getPassengersCount();
    const departuresData = this.railwayService.getDeparturesData();
    this.route.queryParams.subscribe((params) => {
      const trainId = params['trainId'];
      if (trainId) {
        this.railwayService.getTrainDetails(trainId).subscribe({
          next: (data: TrainInterface) => {
            this.trainDetails = data;
            this.vagons = this.trainDetails.vagons || [];

            const selectedTrain = departuresData.find((departure: DepartureInterface) =>
              departure.trains.some((train: TrainInterface) => train.id === this.trainDetails?.id)
            );
            if (selectedTrain) {
              const selectedTrainDetails = selectedTrain.trains.find(
                (train: TrainInterface) => train.id === this.trainDetails?.id
              );
              if (selectedTrainDetails) {
                this.vagons = selectedTrainDetails.vagons || [];
              }
            }
            this.generatePassengerForms(this.passengersCount);
          },
          error: (err) => {
            console.error('Error fetching train details:', err);
          },
        });
      }
    });
  }
  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: KeyboardEvent): void {
    this.selectedSeats=[];
    this.showSeatPopup = false;
    this.showPaymentPopup = false;
  }
  get passengers(): FormArray {
    return this.bookForm.get('passengers') as FormArray;
  }
  generatePassengerForms(count: number): void {
    const passengers = this.bookForm.get('passengers') as FormArray;
    passengers.clear();
    for (let i = 0; i < count; i++) {
      passengers.push(
        this.fb.group({
          name: ['', Validators.required],
          surname: ['', Validators.required],
          idNumber: ['', Validators.required],
          seat: this.fb.group({
            seatId: [null, Validators.required],
            number: ['', Validators.required],
            price: [0, Validators.required],
          }),
        })
      );
    }
  }
  openSeatSelection(index: number): void {
    this.selectedPassengerIndex = index;
    this.showSeatPopup = true;
  }
  closeSeatSelection(): void {
    this.selectedSeats=[];
    this.showSeatPopup = false;
  }
  calculateTotalPrice(): number {
    const passengers = this.bookForm.value.passengers || [];
    return passengers.reduce(
      (total: number, passenger: any) => total + (passenger.seat?.price || 0),
      0
    );
  }
  selectVagon(vagon: VagonInterface): void {
    if (vagon.seats?.length) {
      this.selectedSeats = vagon.seats;
      console.log('Selected Seats:', this.selectedSeats);
      console.log(vagon)
    } else {
      console.error('No seats available for the selected vagon.');
      this.selectedSeats = [];
    }
  }
  assignSeatToPassenger(seat: SeatInterface): void {
    if (this.selectedPassengerIndex !== null) {
      const passengers = this.bookForm.get('passengers') as FormArray;
      passengers.at(this.selectedPassengerIndex).patchValue({
        seat: {
          seatId: seat.seatId,
          number: seat.number,
          price: seat.price,
        },
      });
      seat.isOccupied = true;
      this.selectedSeats=[];
      this.showSeatPopup = false;
      this.selectedPassengerIndex = null;
    }
  }
  openPaymentPopup(): void {
    if (!this.bookForm.valid) {
      console.error('Form is invalid');
      return;
    }
    this.showPaymentPopup = true;
  }
  closePaymentPopup(): void {
    this.showPaymentPopup = false;
  }
  submitPayment(): void {
    if (!this.paymentForm.valid) {
      console.error('Payment form is invalid');
      return;
    }
    this.bookTickets();
    this.showPaymentPopup = false;
  }
  bookTickets(): void {
    const trainId = this.trainDetails?.id;
    if (!trainId) {
      console.error('Train ID is missing.');
      return;
    }
    this.railwayService.setContactDetails({
      email: this.bookForm.value.email,
      phoneNumber: this.bookForm.value.phoneNumber,
    });
    const passengers: PassengerInterface[] = this.bookForm.value.passengers.map((passenger: PassengerInterface) => ({
      name: passenger.name,
      surname: passenger.surname,
      idNumber: passenger.idNumber,
      seat: passenger.seat,
    }));
    const requestBody: RequestBodyInterface = {
      trainId,
      date: new Date().toISOString(),
      email: this.bookForm.value.email,
      phoneNumber: this.bookForm.value.phoneNumber,
      people: passengers.map((passenger) => ({
        seatId: passenger.seat.seatId,
        name: passenger.name,
        surname: passenger.surname,
        idNumber: passenger.idNumber,
        status: 'selected',
        payoutCompleted: false,
      })),
    };
    this.railwayService.sendBookingData(requestBody).subscribe({
      next: (response: string) => {
        const responseParts = response.split(':');
        const ticketId = responseParts.length > 1 ? responseParts[1].trim() : null;
        if (ticketId) {
          alert(`ბილეთი დარეგისტრირდა წარმატებით!`);
          this.router.navigate(['/ticket-form'], { queryParams: { ticketId } });
        } else {
          alert('Ticket ID not found. Please contact support.');
        }
      },
      error: () => {
        alert('Booking failed. Please try again.');
      },
    });
  }
}
