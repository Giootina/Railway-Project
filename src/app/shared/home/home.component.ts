import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RailwayService } from '../../services/railway.service';
import { DepartureInterface } from '../../interfaces/railway.interfaces';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false,
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  bookTrainForm!: FormGroup;
  searchResults: DepartureInterface[] = [];
  message: string = '';
  stations: string[] = ['თბილისი', 'ბათუმი', 'ფოთი'];
  filteredLocations: string[] = [];
  cardStates: boolean[] = [false, false, false, false];

  constructor(private fb: FormBuilder, private railwayService: RailwayService, private router: Router) {}

  ngOnInit(): void {
    this.bookTrainForm = this.fb.group({
      from: ['', Validators.required],
      to: [{ value: '', disabled: true }, Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      passengers: [null, [Validators.required, Validators.min(1), Validators.max(4)]],
    });
    this.bookTrainForm.get('from')?.valueChanges.subscribe((fromValue) => {
      this.bookTrainForm.get('to')?.[fromValue ? 'enable' : 'disable']();
      this.filterLocations(fromValue);
    });
    this.filteredLocations = [...this.stations];
  }
  filterLocations(fromValue: string): void {
    this.filteredLocations = fromValue
      ? this.stations.filter((station) => station !== fromValue)
      : [...this.stations];
  }
  getDepartures(): void {
    const { from, to, date, passengers } = this.bookTrainForm.value;
    this.railwayService.setPassengersCount(passengers);
    this.railwayService.searchDepartures(from, to, date).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.railwayService.setDeparturesData(data);
          this.router.navigate(['/available-departures']);
        } else {
          this.message = 'რეისი არ მოიძებნა!';
        }
      },
      error: () => {
        this.message = 'დაფიქსირდა შეცდომა, სცადეთ თავიდან.';
      },
    });
  }
  navigateToBooking(trainId: string): void {
    this.router.navigate(['/book-ticket'], { queryParams: { trainId } });
  }
  toggleCard(index: number): void {
    this.cardStates[index] = !this.cardStates[index];
  }
}
