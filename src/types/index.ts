export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export type MovieFormat = '2D' | '3D' | 'IMAX 3D' | '4DX';

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  description: string;
  duration: number; // in minutes
  genre: string[];
  language: string;
  releaseDate: string;
  rating: number; // e.g. 8.8
  censorRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  posterUrl: string;
  bannerUrl?: string;
  director: string;
  cast: string[];
  trailerUrl?: string;
  formats: MovieFormat[];
  isNowShowing: boolean;
  isUpcoming: boolean;
  featured?: boolean;
}

export interface Screen {
  screenNumber: number;
  name: string;
  seatingCapacity: number;
  type: string; // e.g. "IMAX Laser", "Dolby Atmos Premium", "Standard Digital"
}

export interface Theatre {
  id: string;
  name: string;
  city: string;
  location: string;
  address: string;
  totalScreens: number;
  screens: Screen[];
}

export type SeatType = 'silver' | 'gold' | 'vip';
export type SeatStatus = 'available' | 'selected' | 'booked' | 'locked';

export interface Seat {
  id: string;
  row: string; // 'A', 'B', etc.
  number: number;
  type: SeatType;
  price: number;
  status: SeatStatus;
  lockedBy?: string;
  lockedUntil?: number;
}

export interface ShowPricing {
  silver: number;
  gold: number;
  vip: number;
}

export interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  screenNumber: number;
  screenName: string;
  showDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "14:30"
  endTime: string;
  format: MovieFormat;
  pricing: ShowPricing;
  seats: Seat[];
  availableSeatsCount?: number;
  totalSeats?: number;
  movie?: Movie;
  theatre?: Theatre;
}

export interface SnackItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface BookingSnack {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  userName: string;
  userEmail: string;
  showId: string;
  movie: {
    id: string;
    title: string;
    posterUrl: string;
    duration: number;
    format: MovieFormat;
  };
  theatre: {
    id: string;
    name: string;
    city: string;
    screenName: string;
    screenNumber: number;
  };
  showDate: string;
  startTime: string;
  seats: {
    row: string;
    number: number;
    type: SeatType;
    price: number;
  }[];
  snacks: BookingSnack[];
  ticketSubtotal: number;
  convenienceFee: number;
  tax: number;
  totalAmount: number;
  paymentId: string;
  paymentMethod: string;
  bookingStatus: BookingStatus;
  qrCodeData: string;
  bookedAt: string;
  refundAmount?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'cancellation' | 'reminder' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  activeMoviesCount: number;
  averageOccupancy: number;
  recentBookings: Booking[];
  revenueByGenre: { genre: string; revenue: number }[];
  theatrePerformance: { theatre: string; bookings: number; revenue: number }[];
}
