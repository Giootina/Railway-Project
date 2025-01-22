import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DepartureInterface, TrainInterface, ContactInterface, PassengerInterface, VagonInterface, RequestBodyInterface, TicketInterface } from '../interfaces/railway.interfaces';

@Injectable({
  providedIn: 'root',
})
export class RailwayService {
  private apiUrl = 'https://railway.stepprojects.ge/api';
  private departuresData: DepartureInterface[] = [];
  private passengersCount: number = 1;
  private trainDetails: TrainInterface | null = null;
  private passengerDetails: PassengerInterface[] = [];
  private contactDetails: ContactInterface = { email: '', phoneNumber: '' };

  constructor(private http: HttpClient) {}

  setPassengersCount(count: number): void {
    this.passengersCount = count;
  }
  getPassengersCount(): number {
    return this.passengersCount;
  }
  searchDepartures(from: string, to: string, date: string): Observable<DepartureInterface[]> {
    return this.http.get<DepartureInterface[]>(`${this.apiUrl}/getdeparture`, { params: { from, to, date } });
  }
  setDeparturesData(data: DepartureInterface[]): void {
    this.departuresData = data;
  }
  getDeparturesData(): DepartureInterface[] {
    return this.departuresData;
  }
  getTrainDetails(trainId: string): Observable<TrainInterface> {
    return this.http.get<TrainInterface>(`${this.apiUrl}/trains/${trainId}`);
  }
  setTrainDetails(details: TrainInterface): void {
    this.trainDetails = details;
  }
  getTrainDetailsById(trainId: string): Observable<TrainInterface> {
    return this.http.get<TrainInterface>(`${this.apiUrl}/trains/${trainId}`);
  }
  getTrainVagons(trainId: string): Observable<VagonInterface[]> {
    return this.http.get<VagonInterface[]>(`${this.apiUrl}/getvagon/${trainId}/`);
  }
  setPassengerDetails(details: PassengerInterface[]): void {
    this.passengerDetails = details;
  }
  getPassengerDetails(): PassengerInterface[] {
    return this.passengerDetails;
  }
  setContactDetails(details: ContactInterface): void {
    this.contactDetails = details;
  }
  getContactDetails(): ContactInterface {
    return this.contactDetails;
  }
  generateRequestBody(): RequestBodyInterface {
    if (!this.trainDetails) {
      throw new Error('Train details are not set.');
    }
    const requestBody: RequestBodyInterface = {
      trainId: this.trainDetails.id,
      date: new Date().toISOString(),
      email: this.contactDetails.email,
      phoneNumber: this.contactDetails.phoneNumber,
      people: this.passengerDetails.map((passenger) => ({
        seatId: passenger.seat.seatId || null,
        name: passenger.name,
        surname: passenger.surname,
        idNumber: passenger.idNumber,
        status: 'string',
        payoutCompleted: false,
      })),
    };
    return requestBody;
  }
  sendBookingData(requestBody: RequestBodyInterface): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/tickets/register`, requestBody, {
      responseType: 'text' as 'json',
    });
  }
  checkTicketById(ticketId: string): Observable<TicketInterface> {
    return this.http.get<TicketInterface>(`${this.apiUrl}/tickets/checkstatus/${ticketId}`);
  }
  deleteTicketById(ticketId: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/tickets/cancel/${ticketId}`, { responseType: 'text' as 'json' });
  }
}
