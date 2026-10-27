import {
  User,
  Movie,
  Theatre,
  Show,
  Booking,
  Notification,
  AdminStats,
} from '../types/index.js';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('imovies_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sign in.');
    return data;
  },

  async register(payload: { name: string; email: string; password: string; phone?: string; role?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed.');
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Not authenticated.');
    return data;
  },

  async getDemoAccounts(): Promise<{ admin: any; user: any }> {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return res.json();
  },

  // Movies
  async getMovies(params?: { search?: string; genre?: string; language?: string; format?: string; status?: string }): Promise<{ count: number; movies: Movie[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.genre) query.append('genre', params.genre);
    if (params?.language) query.append('language', params.language);
    if (params?.format) query.append('format', params.format);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/movies?${query.toString()}`);
    return res.json();
  },

  async getMovieById(id: string): Promise<{ movie: Movie; shows: Show[] }> {
    const res = await fetch(`${API_BASE}/movies/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Movie not found.');
    return data;
  },

  async createMovie(movieData: Partial<Movie>): Promise<{ movie: Movie }> {
    const res = await fetch(`${API_BASE}/movies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(movieData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create movie.');
    return data;
  },

  async updateMovie(id: string, movieData: Partial<Movie>): Promise<{ movie: Movie }> {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(movieData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update movie.');
    return data;
  },

  async deleteMovie(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete movie.');
    }
  },

  // Theatres
  async getTheatres(city?: string): Promise<{ cities: string[]; theatres: Theatre[] }> {
    const query = city ? `?city=${encodeURIComponent(city)}` : '';
    const res = await fetch(`${API_BASE}/theatres${query}`);
    return res.json();
  },

  async createTheatre(theatreData: Partial<Theatre>): Promise<{ theatre: Theatre }> {
    const res = await fetch(`${API_BASE}/theatres`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(theatreData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create theatre.');
    return data;
  },

  // Shows
  async getShows(params?: { movieId?: string; theatreId?: string; date?: string; city?: string }): Promise<{ shows: Show[] }> {
    const query = new URLSearchParams();
    if (params?.movieId) query.append('movieId', params.movieId);
    if (params?.theatreId) query.append('theatreId', params.theatreId);
    if (params?.date) query.append('date', params.date);
    if (params?.city) query.append('city', params.city);

    const res = await fetch(`${API_BASE}/shows?${query.toString()}`);
    return res.json();
  },

  async getShowById(id: string): Promise<{ show: Show }> {
    const res = await fetch(`${API_BASE}/shows/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Show not found.');
    return data;
  },

  async lockSeats(showId: string, seatIds: string[]): Promise<{ message: string; lockedUntil: number; expiresInSeconds: number }> {
    const res = await fetch(`${API_BASE}/shows/${showId}/lock-seats`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ seatIds }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not hold seats.');
    return data;
  },

  async unlockSeats(showId: string, seatIds?: string[]): Promise<void> {
    await fetch(`${API_BASE}/shows/${showId}/unlock-seats`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ seatIds }),
    });
  },

  async createShow(showData: any): Promise<{ show: Show }> {
    const res = await fetch(`${API_BASE}/shows`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(showData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to schedule show.');
    return data;
  },

  async deleteShow(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/shows/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete show.');
    }
  },

  // Bookings
  async getMyBookings(): Promise<{ bookings: Booking[] }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load bookings.');
    return data;
  },

  async getBookingById(id: string): Promise<{ booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Booking ticket not found.');
    return data;
  },

  async createBooking(payload: {
    showId: string;
    seatIds: string[];
    snacks?: any[];
    paymentMethod?: string;
  }): Promise<{ message: string; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to complete booking.');
    return data;
  },

  async cancelBooking(id: string): Promise<{ message: string; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel booking.');
    return data;
  },

  async getAllBookings(): Promise<{ bookings: Booking[] }> {
    const res = await fetch(`${API_BASE}/bookings/admin/all`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin bookings.');
    return data;
  },

  async getAdminStats(): Promise<{ stats: AdminStats }> {
    const res = await fetch(`${API_BASE}/bookings/admin/stats`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics.');
    return data;
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },
};
