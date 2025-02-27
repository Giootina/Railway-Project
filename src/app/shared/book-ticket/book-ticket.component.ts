import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RailwayService } from '../../services/railway.service';
import { DepartureInterface, PassengerInterface, RequestBodyInterface, SeatInterface, TrainInterface, VagonInterface } from '../../interfaces/railway.interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-book-ticket',
  templateUrl: './book-ticket.component.html',
  standalone: false,
  styleUrls: ['./book-ticket.component.css'],
})
export class BookTicketComponent implements OnInit {
  bookForm!: FormGroup;
  paymentForm!: FormGroup;
  trainDetails!: TrainInterface;
  passengersCount: number = 0;
  vagons: VagonInterface[] = [];
  selectedVagon!: VagonInterface;
  selectedPassengerIndex: number | null = null;
  selectedSeats: SeatInterface[] = [];
  showSeatPopup: boolean = false;
  showPaymentPopup: boolean = false;
  
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private railwayService: RailwayService, private router: Router) {}

  ngOnInit(): void {
    this.bookForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
      passengers: this.fb.array([]),
      termsAccepted: [false, Validators.requiredTrue],
    });
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^(?:\d{16}|(?:\d{4}[-\s]){3}\d{4})$/)]],                                    
      cardHolder: ['', [Validators.required,Validators.minLength(5),Validators.maxLength(40),Validators.pattern(/^[ა-ჰA-Za-z\s]+$/)]],
      expireDate: [new Date().toISOString().split('T')[0], Validators.required],
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
        });
      }
    });
  }
  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(): void {
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
          name: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(20),Validators.pattern(/^[ა-ჰA-Za-z\s]+$/)]],
          surname: ['',[Validators.required,Validators.minLength(3),Validators.maxLength(30),Validators.pattern(/^[ა-ჰA-Za-z\s]+$/)]],
          idNumber: ['',[Validators.required,Validators.pattern(/^\d{11}$/)]],
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
    const seatControl = (this.bookForm.get('passengers') as FormArray).at(index).get('seat.number');
    const seatButton = document.getElementById(`choose-seat-btn-${index}`);
    if (seatControl && seatButton) {
      seatButton.textContent = seatControl.value || 'ადგილის არჩევა';
    }
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
    this.selectedVagon = vagon;
    if (vagon.seats?.length) {
      this.selectedSeats = vagon.seats.sort((a, b) => {
        const numberA = a.number ? a.number.match(/\d+/g) : null;
        const numberB = b.number ? b.number.match(/\d+/g) : null;
        const numA = numberA ? parseInt(numberA[0]) : 0;
        const numB = numberB ? parseInt(numberB[0]) : 0;
        return numA - numB || a.number.localeCompare(b.number);
      });
      this.selectedSeats = vagon.seats;
    } else {
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
    this.showPaymentPopup = true;
  }
  formatCardNumber(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      let value = target.value.replace(/\D/g, '');
      const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1-');
      target.value = formattedValue;
    }
  }
  submitPayment(): void {
    this.bookTickets();
    this.showPaymentPopup = false;
  }
  closePaymentPopup(): void {
    this.showPaymentPopup = false;
  }
  bookTickets(): void {
    const trainId = this.trainDetails?.id;
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
          Swal.fire({
            title: 'ბილეთი რეგისტრირებულია',
            text: 'თქვენი ბილეთი დარეგისტრირდა წარმატებით',
            icon: 'success',
            timer: 2500,
            showConfirmButton: false,
          });
          setTimeout(() => {
            this.router.navigate(['/check-ticket'], { queryParams: { ticketId } });
          }, 2000);
        }
      },
    });
  }
}
