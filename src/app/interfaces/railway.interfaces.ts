export interface DepartureInterface {
  id: number;
  date: string;
  source: string;
  destination: string;
  trains: TrainInterface[];
}
export interface TrainInterface {
  id: string;
  name: string;  
  number: string;
  from: string; 
  to: string; 
  departure: string;
  arrive: string;
  date: string;
  vagons: VagonInterface[];
}
export interface ContactInterface {
  email: string; 
  phoneNumber: string;
}
export interface PassengerInterface {
  name: string;
  surname: string;
  idNumber: string;
  stampRotationDegrees: number;
  seat: SeatInterface;
}
export interface VagonInterface {
  id: string;     
  name: string;  
  seats: SeatInterface[];
}
export interface SeatInterface {
  seatId: string;
  number: string;
  price: number;
  isOccupied: boolean;
}
export interface RequestBodyInterface {
  trainId: string;
  date: string;
  email: string;
  phoneNumber: string;
  people: {
    seatId: string | null;
    name: string;
    surname: string;
    idNumber: string;
    status: string;
    payoutCompleted: boolean;
  }[];
}
export interface TicketInterface {
  id: string;            
  date: string;         
  train: TrainInterface;  
  persons: PassengerInterface[];
  ticketPrice: string;
  email: string;       
  phone: string;         
}


  