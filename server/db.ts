import bcrypt from 'bcryptjs';
import {
  User,
  Movie,
  Theatre,
  Show,
  Seat,
  Booking,
  Notification,
  AdminStats,
  MovieFormat,
} from '../src/types/index.js';

// Seat matrix generator helper
function generateSeats(silverPrice: number, goldPrice: number, vipPrice: number): Seat[] {
  const seats: Seat[] = [];
  const rows = [
    { row: 'A', type: 'silver' as const, price: silverPrice, count: 12 },
    { row: 'B', type: 'silver' as const, price: silverPrice, count: 12 },
    { row: 'C', type: 'silver' as const, price: silverPrice, count: 12 },
    { row: 'D', type: 'gold' as const, price: goldPrice, count: 12 },
    { row: 'E', type: 'gold' as const, price: goldPrice, count: 12 },
    { row: 'F', type: 'gold' as const, price: goldPrice, count: 12 },
    { row: 'G', type: 'vip' as const, price: vipPrice, count: 10 },
    { row: 'H', type: 'vip' as const, price: vipPrice, count: 10 },
  ];

  for (const r of rows) {
    for (let num = 1; num <= r.count; num++) {
      // Pre-book a couple of random seats for realism
      const isRandomBooked = (r.row === 'E' && (num === 5 || num === 6)) || (r.row === 'G' && (num === 4 || num === 5));
      seats.push({
        id: `${r.row}${num}`,
        row: r.row,
        number: num,
        type: r.type,
        price: r.price,
        status: isRandomBooked ? 'booked' : 'available',
      });
    }
  }

  return seats;
}

// Generate dates for current week
function getDateOffset(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

class Database {
  users: User[] = [];
  passwords: Map<string, string> = new Map(); // userId -> bcrypt hashed password
  movies: Movie[] = [];
  theatres: Theatre[] = [];
  shows: Show[] = [];
  bookings: Booking[] = [];
  notifications: Notification[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    const salt = bcrypt.genSaltSync(10);

    // 1. Users (Admin and Demo User)
    const adminUser: User = {
      id: 'usr_admin_01',
      name: 'Victoria Vance (Cinema Director)',
      email: 'admin@imovies.cinema',
      role: 'admin',
      phone: '+1 (555) 902-8800',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString(),
    };
    this.users.push(adminUser);
    this.passwords.set(adminUser.id, bcrypt.hashSync('Admin@123', salt));

    const standardUser: User = {
      id: 'usr_customer_01',
      name: 'Alex Mercer',
      email: 'alex@cinephile.com',
      role: 'user',
      phone: '+1 (555) 349-1122',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString(),
    };
    this.users.push(standardUser);
    this.passwords.set(standardUser.id, bcrypt.hashSync('User@123', salt));

    // 2. Theatres
    this.theatres = [
      {
        id: 'th_01',
        name: 'Grand CineDome IMAX',
        city: 'New York',
        location: 'Midtown Manhattan, 42nd St',
        address: '234 W 42nd Street, New York, NY 10036',
        totalScreens: 4,
        screens: [
          { screenNumber: 1, name: 'IMAX Laser Auditorium', seatingCapacity: 92, type: 'IMAX Laser 4K' },
          { screenNumber: 2, name: 'Dolby Atmos Hall A', seatingCapacity: 92, type: 'Dolby Atmos Surround' },
          { screenNumber: 3, name: 'VIP Luxe Recliner Lounge', seatingCapacity: 72, type: 'Luxe Recliner 3D' },
          { screenNumber: 4, name: 'Standard Cinema 4', seatingCapacity: 92, type: 'Digital 4K' },
        ],
      },
      {
        id: 'th_02',
        name: 'The Regent Cinema & Lounge',
        city: 'Los Angeles',
        location: 'West Hollywood',
        address: '8818 Sunset Blvd, West Hollywood, CA 90069',
        totalScreens: 3,
        screens: [
          { screenNumber: 1, name: 'Cinema 1 Premier', seatingCapacity: 92, type: 'Laser 4K HDR' },
          { screenNumber: 2, name: 'Auditorium 2 Dolby', seatingCapacity: 92, type: 'Dolby Atmos' },
          { screenNumber: 3, name: 'Intimate Recliner Room', seatingCapacity: 64, type: 'VIP Recliners' },
        ],
      },
      {
        id: 'th_03',
        name: 'Apex Metrolux Pavilion',
        city: 'Chicago',
        location: 'Downtown River North',
        address: '500 N Michigan Ave, Chicago, IL 60611',
        totalScreens: 3,
        screens: [
          { screenNumber: 1, name: 'Grand Screen 1', seatingCapacity: 92, type: '4DX Motion Theater' },
          { screenNumber: 2, name: 'Dolby Screen 2', seatingCapacity: 92, type: 'Dolby Cinema' },
          { screenNumber: 3, name: 'Standard Screen 3', seatingCapacity: 92, type: 'Digital 2D' },
        ],
      },
    ];

    // 3. Movies
    this.movies = [
      {
        id: 'mov_01',
        title: 'Shadow Protocol',
        tagline: 'In a world of lies, the only truth is survival.',
        description: 'In a rain-slicked cyberpunk metropolis of Neo-Kyoto, a disenfranchised synthetic intelligence operative uncovers a sinister corporate conspiracy erasing memories of free citizens. High-octane kinetic martial arts meets atmospheric neo-noir worldbuilding.',
        duration: 142,
        genre: ['Action', 'Sci-Fi', 'Cyberpunk', 'Thriller'],
        language: 'English',
        releaseDate: '2026-10-15',
        rating: 8.9,
        censorRating: 'PG-13',
        posterUrl: '/src/assets/images/poster_shadow_protocol_1793005407803.jpg',
        bannerUrl: '/src/assets/images/poster_shadow_protocol_1793005407803.jpg',
        director: 'Marcus Sterling',
        cast: ['Kenji Sato', 'Elena Rostova', 'David Vance', 'Maya Lin'],
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        formats: ['IMAX 3D', '4DX', '2D'],
        isNowShowing: true,
        isUpcoming: false,
        featured: true,
      },
      {
        id: 'mov_02',
        title: 'Chronos: The Clockwork Realm',
        tagline: 'Adventure awaits beyond time.',
        description: 'When ancient celestial astrolabes begin reversing cosmic tides, four unlikely adventurers embark on a spellbinding journey through floating clockwork ruins and forgotten gothic citadel realms to mend the fabric of reality itself.',
        duration: 135,
        genre: ['Fantasy', 'Adventure', 'Mystery'],
        language: 'English',
        releaseDate: '2026-10-20',
        rating: 9.1,
        censorRating: 'PG',
        posterUrl: '/src/assets/images/poster_chronos_realm_1793005408097.jpg',
        bannerUrl: '/src/assets/images/poster_chronos_realm_1793005408097.jpg',
        director: 'Astrid Lindholm',
        cast: ['Aria Pendelton', 'Lord Caspar Thorne', 'Theron Fox', 'Sylvia Drake'],
        formats: ['3D', '2D', 'IMAX 3D'],
        isNowShowing: true,
        isUpcoming: false,
        featured: true,
      },
      {
        id: 'mov_03',
        title: 'The Whispering Pines',
        tagline: 'Something lives in the dark. It knows your secrets.',
        description: 'An investigative cartographer retreats to an isolated mountain outpost in the Pacific Northwest to map an ancient uncharted valley. As twilight descends, the whispers among the mist-drenched redwoods reveal a terrifying psychological truth.',
        duration: 118,
        genre: ['Mystery', 'Psychological Thriller', 'Horror'],
        language: 'English',
        releaseDate: '2026-10-31',
        rating: 8.6,
        censorRating: 'R',
        posterUrl: '/src/assets/images/poster_whispering_pines_1793005408276.jpg',
        bannerUrl: '/src/assets/images/poster_whispering_pines_1793005408276.jpg',
        director: 'Eliza Reed',
        cast: ['Alexia Reed', 'Liam Connolly', 'Gabriel Stone', 'Claire Dupont'],
        formats: ['2D', '3D'],
        isNowShowing: true,
        isUpcoming: false,
        featured: false,
      },
      {
        id: 'mov_04',
        title: 'Astra: Beyond the Event Horizon',
        tagline: 'Beyond our solar system lies our final reckoning.',
        description: 'A deep-space expedition ventures beyond the perimeter of known celestial mechanics into a fractured accretion disk. Experience jaw-dropping spatial physics, gravitational anomaly sequences, and emotional human survival.',
        duration: 156,
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        language: 'English',
        releaseDate: '2026-11-12',
        rating: 9.3,
        censorRating: 'PG-13',
        posterUrl: '/src/assets/images/hero_cinema_hall_1793005405988.jpg',
        bannerUrl: '/src/assets/images/hero_cinema_hall_1793005405988.jpg',
        director: 'Julian Christopher',
        cast: ['Matthew Vance', 'Jessica Cole', 'Dr. Aris Thorne'],
        formats: ['IMAX 3D', '4DX', '2D'],
        isNowShowing: false,
        isUpcoming: true,
        featured: false,
      },
    ];

    // 4. Generate Shows for Today and Next 3 Days
    const showTimes = [
      { start: '10:30', end: '13:00', format: '2D' as MovieFormat, silver: 12.0, gold: 16.0, vip: 21.0 },
      { start: '13:45', end: '16:15', format: 'IMAX 3D' as MovieFormat, silver: 15.0, gold: 19.5, vip: 25.0 },
      { start: '17:15', end: '19:45', format: '3D' as MovieFormat, silver: 14.0, gold: 18.0, vip: 24.0 },
      { start: '20:30', end: '23:00', format: 'IMAX 3D' as MovieFormat, silver: 16.0, gold: 20.0, vip: 26.0 },
      { start: '23:30', end: '01:50', format: '2D' as MovieFormat, silver: 11.0, gold: 15.0, vip: 20.0 },
    ];

    let showCounter = 1;
    for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
      const showDate = getDateOffset(dayOffset);

      for (const movie of this.movies.filter(m => m.isNowShowing)) {
        for (const theatre of this.theatres) {
          // Select 2-3 showtimes per movie per theatre
          const selectedTimes = showTimes.slice(0, 3);
          for (let idx = 0; idx < selectedTimes.length; idx++) {
            const st = selectedTimes[idx];
            const screen = theatre.screens[idx % theatre.screens.length];
            const showId = `sh_${showCounter++}`;

            this.shows.push({
              id: showId,
              movieId: movie.id,
              theatreId: theatre.id,
              screenNumber: screen.screenNumber,
              screenName: screen.name,
              showDate,
              startTime: st.start,
              endTime: st.end,
              format: st.format,
              pricing: {
                silver: st.silver,
                gold: st.gold,
                vip: st.vip,
              },
              seats: generateSeats(st.silver, st.gold, st.vip),
            });
          }
        }
      }
    }

    // 5. Seed initial confirmed bookings for demonstration
    const sampleShow = this.shows[1] || this.shows[0];
    const sampleMovie = this.movies.find(m => m.id === sampleShow.movieId)!;
    const sampleTheatre = this.theatres.find(t => t.id === sampleShow.theatreId)!;

    const initialBooking: Booking = {
      id: 'bk_demo_88219',
      bookingReference: 'IM-882194',
      userId: standardUser.id,
      userName: standardUser.name,
      userEmail: standardUser.email,
      showId: sampleShow.id,
      movie: {
        id: sampleMovie.id,
        title: sampleMovie.title,
        posterUrl: sampleMovie.posterUrl,
        duration: sampleMovie.duration,
        format: sampleShow.format,
      },
      theatre: {
        id: sampleTheatre.id,
        name: sampleTheatre.name,
        city: sampleTheatre.city,
        screenName: sampleShow.screenName,
        screenNumber: sampleShow.screenNumber,
      },
      showDate: sampleShow.showDate,
      startTime: sampleShow.startTime,
      seats: [
        { row: 'E', number: 5, type: 'gold', price: sampleShow.pricing.gold },
        { row: 'E', number: 6, type: 'gold', price: sampleShow.pricing.gold },
      ],
      snacks: [
        { id: 'snk_popcorn', name: 'Jumbo Butter Popcorn', price: 8.5, quantity: 1 },
        { id: 'snk_cola', name: 'Ice Cold Fountain Soda', price: 5.0, quantity: 2 },
      ],
      ticketSubtotal: sampleShow.pricing.gold * 2,
      convenienceFee: 3.5,
      tax: 2.8,
      totalAmount: sampleShow.pricing.gold * 2 + 18.5 + 3.5 + 2.8,
      paymentId: 'pay_tx_772910384',
      paymentMethod: 'Credit Card (•••• 4242)',
      bookingStatus: 'confirmed',
      qrCodeData: `IMOVIES-TICKET|REF:IM-882194|SHOW:${sampleShow.id}|SEATS:E5,E6`,
      bookedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    };

    this.bookings.push(initialBooking);

    // Initial notification
    this.notifications.push({
      id: 'notif_01',
      userId: standardUser.id,
      title: 'Booking Confirmed!',
      message: `Your tickets for "${sampleMovie.title}" at ${sampleTheatre.name} have been confirmed. Reference: IM-882194`,
      type: 'booking',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    });
  }

  // Seat lock cleanup logic: automatically releases seats locked > 5 minutes ago
  cleanExpiredLocks(showId?: string) {
    const now = Date.now();
    const showsToCheck = showId ? this.shows.filter(s => s.id === showId) : this.shows;

    for (const show of showsToCheck) {
      for (const seat of show.seats) {
        if (seat.status === 'locked' && seat.lockedUntil && seat.lockedUntil < now) {
          seat.status = 'available';
          seat.lockedBy = undefined;
          seat.lockedUntil = undefined;
        }
      }
    }
  }

  getShowWithDetails(showId: string): Show | undefined {
    this.cleanExpiredLocks(showId);
    const show = this.shows.find(s => s.id === showId);
    if (!show) return undefined;

    const movie = this.movies.find(m => m.id === show.movieId);
    const theatre = this.theatres.find(t => t.id === show.theatreId);

    return {
      ...show,
      movie,
      theatre,
    };
  }

  getAdminStats(): AdminStats {
    const activeBookings = this.bookings.filter(b => b.bookingStatus === 'confirmed');
    const totalRevenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTicketsSold = activeBookings.reduce((sum, b) => sum + b.seats.length, 0);
    const activeMoviesCount = this.movies.filter(m => m.isNowShowing).length;

    // Calculate occupancy rate
    let totalSeatsInActiveShows = 0;
    let bookedSeatsInActiveShows = 0;

    for (const show of this.shows) {
      totalSeatsInActiveShows += show.seats.length;
      bookedSeatsInActiveShows += show.seats.filter(s => s.status === 'booked').length;
    }

    const averageOccupancy = totalSeatsInActiveShows > 0
      ? Math.round((bookedSeatsInActiveShows / totalSeatsInActiveShows) * 100)
      : 0;

    // Revenue by genre
    const genreMap = new Map<string, number>();
    for (const b of activeBookings) {
      const movie = this.movies.find(m => m.id === b.movie.id);
      if (movie) {
        for (const g of movie.genre) {
          genreMap.set(g, (genreMap.get(g) || 0) + b.totalAmount / movie.genre.length);
        }
      }
    }

    const revenueByGenre = Array.from(genreMap.entries()).map(([genre, revenue]) => ({
      genre,
      revenue: Math.round(revenue),
    }));

    // Theatre performance
    const theatreMap = new Map<string, { bookings: number; revenue: number }>();
    for (const b of activeBookings) {
      const tName = b.theatre.name;
      const current = theatreMap.get(tName) || { bookings: 0, revenue: 0 };
      theatreMap.set(tName, {
        bookings: current.bookings + 1,
        revenue: Math.round(current.revenue + b.totalAmount),
      });
    }

    const theatrePerformance = Array.from(theatreMap.entries()).map(([theatre, data]) => ({
      theatre,
      bookings: data.bookings,
      revenue: data.revenue,
    }));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalBookings: activeBookings.length,
      totalTicketsSold,
      activeMoviesCount,
      averageOccupancy,
      recentBookings: this.bookings.slice(-10).reverse(),
      revenueByGenre,
      theatrePerformance,
    };
  }
}

export const db = new Database();
