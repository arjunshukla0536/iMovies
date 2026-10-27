import React, { useState, useEffect } from 'react';
import {
  Shield,
  Film,
  Ticket,
  Plus,
  Trash2,
  DollarSign,
  Users,
  Search,
} from 'lucide-react';
import { AdminStats, Movie, Show, Theatre, Booking, MovieFormat } from '../types/index.js';
import { api } from '../services/api.js';
import { useNotifications } from '../context/NotificationContext.js';

export default function AdminDashboard() {
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'analytics' | 'movies' | 'shows' | 'bookings'>('analytics');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [showAddShowModal, setShowAddShowModal] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');

  // Form states for Add Movie
  const [movieForm, setMovieForm] = useState({
    title: '',
    tagline: '',
    description: '',
    duration: 120,
    genre: 'Action, Sci-Fi',
    language: 'English',
    rating: 8.5,
    censorRating: 'PG-13',
    director: '',
    cast: '',
    posterUrl: '/src/assets/images/poster_shadow_protocol_1793005407803.jpg',
    formats: ['2D', '3D', 'IMAX 3D'],
    isNowShowing: true,
  });

  // Form states for Schedule Show
  const [showForm, setShowForm] = useState({
    movieId: '',
    theatreId: '',
    screenNumber: 1,
    showDate: new Date().toISOString().split('T')[0],
    startTime: '19:30',
    format: 'IMAX 3D',
    silverPrice: 12.0,
    goldPrice: 16.0,
    vipPrice: 22.0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, moviesRes, theatresRes, showsRes, bookingsRes] = await Promise.all([
        api.getAdminStats(),
        api.getMovies(),
        api.getTheatres(),
        api.getShows(),
        api.getAllBookings(),
      ]);

      setStats(statsRes.stats);
      setMovies(moviesRes.movies);
      setTheatres(theatresRes.theatres);
      setShows(showsRes.shows);
      setAllBookings(bookingsRes.bookings);

      if (moviesRes.movies.length > 0 && !showForm.movieId) {
        setShowForm(prev => ({
          ...prev,
          movieId: moviesRes.movies[0].id,
          theatreId: theatresRes.theatres[0]?.id || '',
        }));
      }
    } catch {
      showToast('Failed to load administrative console data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMovie({
        ...movieForm,
        censorRating: movieForm.censorRating as any,
        genre: movieForm.genre.split(',').map(s => s.trim()),
        cast: movieForm.cast.split(',').map(s => s.trim()),
        formats: movieForm.formats as MovieFormat[],
      });
      showToast(`Movie "${movieForm.title}" added to repertoire!`, 'success');
      setShowAddMovieModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create movie.', 'error');
    }
  };

  const handleDeleteMovie = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? All scheduled shows will also be removed.`)) {
      return;
    }
    try {
      await api.deleteMovie(id);
      showToast(`Movie "${title}" removed.`, 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete movie.', 'error');
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createShow(showForm);
      showToast('Showtime scheduled successfully!', 'success');
      setShowAddShowModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule show.', 'error');
    }
  };

  const handleDeleteShow = async (id: string) => {
    if (!confirm('Cancel and delete this showtime?')) return;
    try {
      await api.deleteShow(id);
      showToast('Show schedule cancelled.', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete show.', 'error');
    }
  };

  const filteredBookings = allBookings.filter(b => {
    if (!bookingSearch) return true;
    const q = bookingSearch.toLowerCase();
    return (
      b.bookingReference.toLowerCase().includes(q) ||
      b.userName.toLowerCase().includes(q) ||
      b.userEmail.toLowerCase().includes(q) ||
      b.movie.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border-light)] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold mb-1.5">
            <span className="glass-pill-purple px-2.5 py-0.5 rounded-md flex items-center gap-1.5 font-bold">
              <Shield className="w-3.5 h-3.5" />
              EXECUTIVE CINEMA OPS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
            Admin Management Console
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Oversee auditorium occupancy, ticket revenue, film catalog, and showtime schedules.
          </p>
        </div>

        {/* Tab Navigation in Glass Capsule */}
        <div className="flex items-center p-1.5 glass-panel rounded-2xl border border-[var(--glass-border-light)] shadow-md gap-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'glass-btn-primary text-white font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'movies'
                ? 'glass-btn-primary text-white font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('shows')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'shows'
                ? 'glass-btn-primary text-white font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Shows ({shows.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'glass-btn-primary text-white font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Bookings Ledger ({allBookings.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-2 border-[#ec4899] border-t-transparent rounded-full animate-spin mx-auto mb-3 shadow-[0_0_20px_rgba(236,72,153,0.3)]" />
          <p className="text-xs text-[var(--text-muted)] font-mono">Loading executive metrics...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: ANALYTICS & OVERVIEW */}
          {activeTab === 'analytics' && stats && (
            <div className="space-y-8">
              {/* Stat metric cards in Glass Panels */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 sm:p-6 glass-panel rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                  <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs mb-2">
                    <span className="font-semibold font-display">Total Ticket Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-black text-[var(--text-primary)] font-mono tabular-nums">
                    ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                    +18.4% performance this week
                  </span>
                </div>

                <div className="p-5 sm:p-6 glass-panel rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                  <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs mb-2">
                    <span className="font-semibold font-display">Confirmed Bookings</span>
                    <div className="w-8 h-8 rounded-xl glass-pill-pink flex items-center justify-center">
                      <Ticket className="w-4 h-4 text-pink-600" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-black text-[var(--text-primary)] font-mono tabular-nums">
                    {stats.totalBookings}
                  </div>
                  <span className="text-[11px] text-[var(--text-secondary)] mt-1 block font-mono">
                    {stats.totalTicketsSold} admissions sold
                  </span>
                </div>

                <div className="p-5 sm:p-6 glass-panel rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
                  <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs mb-2">
                    <span className="font-semibold font-display">Average Occupancy</span>
                    <div className="w-8 h-8 rounded-xl glass-pill-yellow flex items-center justify-center">
                      <Users className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-black text-[var(--text-primary)] font-mono tabular-nums">
                    {stats.averageOccupancy}%
                  </div>
                  <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
                    Across 10 active screens
                  </span>
                </div>

                <div className="p-5 sm:p-6 glass-panel rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                  <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs mb-2">
                    <span className="font-semibold font-display">Now Showing Titles</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600">
                      <Film className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-black text-[var(--text-primary)] font-mono tabular-nums">
                    {stats.activeMoviesCount}
                  </div>
                  <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
                    {theatres.length} multiplex venues
                  </span>
                </div>
              </div>

              {/* Revenue Breakdowns in Frosted Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 sm:p-7 glass-panel rounded-3xl">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 font-display">Revenue by Genre</h3>
                  <div className="space-y-3.5">
                    {stats.revenueByGenre.map(item => (
                      <div key={item.genre} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[var(--text-primary)] font-semibold">{item.genre}</span>
                          <span className="text-gradient-tri font-mono font-bold">${item.revenue}</span>
                        </div>
                        <div className="w-full h-2.5 glass-panel-subtle rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                            style={{
                              width: `${Math.min(100, Math.max(10, (item.revenue / (stats.totalRevenue || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 sm:p-7 glass-panel rounded-3xl">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 font-display">Theatre Venue Performance</h3>
                  <div className="space-y-3">
                    {stats.theatrePerformance.map(item => (
                      <div
                        key={item.theatre}
                        className="p-3.5 glass-panel-subtle rounded-2xl flex items-center justify-between border border-[var(--glass-border-light)]"
                      >
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)] font-display">{item.theatre}</p>
                          <p className="text-[11px] text-[var(--text-secondary)] font-mono">{item.bookings} orders processed</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 glass-pill px-2.5 py-1 rounded-lg">
                          ${item.revenue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOVIES MANAGEMENT */}
          {activeTab === 'movies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--text-secondary)]">
                  Manage cinema film catalog, genres, posters, and screening status.
                </p>
                <button
                  onClick={() => setShowAddMovieModal(true)}
                  className="px-4 py-2.5 glass-btn-primary text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Film</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.map(movie => (
                  <div
                    key={movie.id}
                    className="p-5 glass-card rounded-3xl flex flex-col justify-between"
                  >
                    <div className="flex gap-4 mb-4">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        referrerPolicy="no-referrer"
                        className="w-20 h-28 object-cover rounded-2xl shadow-md border border-white/20 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-mono glass-pill-pink px-2 py-0.5 rounded-md inline-block mb-1.5 font-bold">
                          {movie.isNowShowing ? 'Now Showing' : 'Upcoming'}
                        </span>
                        <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight font-display">
                          {movie.title}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
                          ★ {movie.rating} · {movie.duration}m
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">
                          {movie.genre.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--glass-border-light)] flex items-center justify-between">
                      <span className="text-xs font-mono text-[var(--text-secondary)]">
                        {movie.formats.join(', ')}
                      </span>
                      <button
                        onClick={() => handleDeleteMovie(movie.id, movie.title)}
                        className="p-2 text-[var(--text-secondary)] hover:text-rose-500 rounded-xl hover:bg-rose-500/15 transition-colors cursor-pointer"
                        title="Delete movie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SHOWS SCHEDULER */}
          {activeTab === 'shows' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--text-secondary)]">
                  Assign films to auditorium screens with dynamic tier pricing.
                </p>
                <button
                  onClick={() => setShowAddShowModal(true)}
                  className="px-4 py-2.5 glass-btn-primary text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Showtime</span>
                </button>
              </div>

              <div className="divide-y divide-[var(--glass-border-light)] glass-panel rounded-3xl overflow-hidden">
                {shows.slice(0, 25).map(show => (
                  <div
                    key={show.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold glass-pill-purple px-2 py-0.5 rounded-md text-[10px]">
                          {show.format}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-secondary)]">
                          {show.showDate} at <span className="text-[var(--text-primary)] font-bold">{show.startTime}</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] font-display">
                        {show.movie?.title}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {show.theatre?.name} · {show.screenName}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-[var(--text-secondary)] glass-pill px-3 py-1 rounded-xl">
                        Silver: ${show.pricing.silver} / Gold: ${show.pricing.gold} / <span className="glass-pill-yellow px-1.5 py-0.5 rounded font-bold">VIP: ${show.pricing.vip}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteShow(show.id)}
                        className="p-2 text-[var(--text-secondary)] hover:text-rose-500 rounded-xl hover:bg-rose-500/15 transition-colors cursor-pointer"
                        title="Delete showtime"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ALL BOOKINGS LEDGER */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative min-w-[300px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                    placeholder="Search by ref #, customer, movie..."
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-2xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                  />
                </div>
                <span className="text-xs text-[var(--text-secondary)] font-mono glass-pill px-3 py-1 rounded-xl">
                  Showing {filteredBookings.length} of {allBookings.length} records
                </span>
              </div>

              <div className="glass-panel rounded-3xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.04] text-[var(--text-secondary)] border-b border-[var(--glass-border-light)] uppercase font-mono text-[11px]">
                    <tr>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Movie & Venue</th>
                      <th className="p-4">Showtime</th>
                      <th className="p-4">Seats</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--glass-border-light)] text-[var(--text-secondary)] font-mono tabular-nums">
                    {filteredBookings.map(b => (
                      <tr key={b.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="p-4 font-bold text-gradient-tri">{b.bookingReference}</td>
                        <td className="p-4 font-sans">
                          <p className="font-semibold text-[var(--text-primary)]">{b.userName}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{b.userEmail}</p>
                        </td>
                        <td className="p-4 font-sans">
                          <p className="font-semibold text-[var(--text-primary)]">{b.movie.title}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{b.theatre.name}</p>
                        </td>
                        <td className="p-4">
                          {b.showDate} {b.startTime}
                        </td>
                        <td className="p-4 font-bold">
                          <span className="glass-pill-pink px-2 py-0.5 rounded-md">
                            {b.seats.map(s => `${s.row}${s.number}`).join(', ')}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-[var(--text-primary)]">${b.totalAmount.toFixed(2)}</td>
                        <td className="p-4">
                          {b.bookingStatus === 'confirmed' ? (
                            <span className="text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg font-sans text-[11px] font-semibold">
                              Confirmed
                            </span>
                          ) : (
                            <span className="text-rose-600 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-lg font-sans text-[11px] font-semibold">
                              Refunded
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Movie Modal */}
      {showAddMovieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl overflow-y-auto">
          <div className="w-full max-w-lg glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-4 my-8 border border-[var(--glass-border-highlight)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--glass-border-light)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">Add Film to Repertoire</h3>
              <button onClick={() => setShowAddMovieModal(false)} className="glass-btn-secondary p-2 rounded-full cursor-pointer hover:bg-white/20">✕</button>
            </div>
            <form onSubmit={handleCreateMovie} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Film Title</label>
                <input
                  type="text"
                  required
                  value={movieForm.title}
                  onChange={e => setMovieForm({ ...movieForm, title: e.target.value })}
                  placeholder="e.g. Dune: Part Three"
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Tagline</label>
                <input
                  type="text"
                  value={movieForm.tagline}
                  onChange={e => setMovieForm({ ...movieForm, tagline: e.target.value })}
                  placeholder="Short cinema tagline"
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={movieForm.description}
                  onChange={e => setMovieForm({ ...movieForm, description: e.target.value })}
                  placeholder="Full plot synopsis..."
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={movieForm.duration}
                    onChange={e => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Rating (out of 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={movieForm.rating}
                    onChange={e => setMovieForm({ ...movieForm, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={movieForm.genre}
                    onChange={e => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Director</label>
                  <input
                    type="text"
                    value={movieForm.director}
                    onChange={e => setMovieForm({ ...movieForm, director: e.target.value })}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Poster Image URL</label>
                <input
                  type="text"
                  value={movieForm.posterUrl}
                  onChange={e => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)] font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMovieModal(false)}
                  className="px-4 py-2 glass-btn-secondary text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 glass-btn-primary text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                >
                  Save Film
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Show Modal */}
      {showAddShowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl overflow-y-auto">
          <div className="w-full max-w-lg glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-4 my-8 border border-[var(--glass-border-highlight)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--glass-border-light)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">Schedule New Showtime</h3>
              <button onClick={() => setShowAddShowModal(false)} className="glass-btn-secondary p-2 rounded-full cursor-pointer hover:bg-white/20">✕</button>
            </div>
            <form onSubmit={handleCreateShow} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Select Film</label>
                <select
                  value={showForm.movieId}
                  onChange={e => setShowForm({ ...showForm, movieId: e.target.value })}
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)]"
                >
                  {movies.map(m => (
                    <option key={m.id} value={m.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Select Theatre Location</label>
                <select
                  value={showForm.theatreId}
                  onChange={e => setShowForm({ ...showForm, theatreId: e.target.value })}
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)]"
                >
                  {theatres.map(t => (
                    <option key={t.id} value={t.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{t.name} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Show Date</label>
                  <input
                    type="date"
                    required
                    value={showForm.showDate}
                    onChange={e => setShowForm({ ...showForm, showDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Start Time (24h)</label>
                  <input
                    type="text"
                    required
                    value={showForm.startTime}
                    placeholder="e.g. 19:30"
                    onChange={e => setShowForm({ ...showForm, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Silver ($)</label>
                  <input
                    type="number"
                    value={showForm.silverPrice}
                    onChange={e => setShowForm({ ...showForm, silverPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Gold ($)</label>
                  <input
                    type="number"
                    value={showForm.goldPrice}
                    onChange={e => setShowForm({ ...showForm, goldPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">VIP Recliner ($)</label>
                  <input
                    type="number"
                    value={showForm.vipPrice}
                    onChange={e => setShowForm({ ...showForm, vipPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[var(--text-primary)] font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddShowModal(false)}
                  className="px-4 py-2 glass-btn-secondary text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 glass-btn-primary text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                >
                  Publish Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
