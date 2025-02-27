import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RailwayService } from '../../services/railway.service';
import { DepartureInterface, TrainInterface } from '../../interfaces/railway.interfaces';

@Component({
  selector: 'app-available-departures',
  templateUrl: './available-departures.component.html',
  standalone: false,
  styleUrls: ['./available-departures.component.css'],
})
export class AvailableDeparturesComponent implements OnInit {
  departures: DepartureInterface[] = [];
  message: string = '';

  constructor(private railwayService: RailwayService, private router: Router) {}

  ngOnInit(): void {
    this.departures = this.railwayService.getDeparturesData();
    if (this.departures.length === 0) {
      this.message = 'რეისი არ მოიძებნა,სცადეთ თავიდან!';
    }
  }
  chooseDeparture(train: TrainInterface): void {
    this.railwayService.setTrainDetails(train);
    this.router.navigate(['/book-ticket'], { queryParams: { trainId: train.id } });
  }
}
