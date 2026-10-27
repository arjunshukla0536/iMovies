import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import Navbar from './components/Navbar.js';
import HeroBanner from './components/HeroBanner.js';
import MovieFilters from './components/MovieFilters.js';
import MovieCard from './components/MovieCard.js';
import ShowtimeSelectorModal from './components/ShowtimeSelectorModal.js';
import SeatSelectionView from './components/SeatSelectionView.js';
import CheckoutModal from './components/CheckoutModal.js';
import DigitalTicketPass from './components/DigitalTicketPass.js';
import MyBookingsView from './components/MyBookingsView.js';
import TheatresView from './components/TheatresView.js';
import AdminDashboard from './components/AdminDashboard.js';
import AuthModal from './components/AuthModal.js';
import { Movie, Show, Seat, BookingSnack, Booking } from './types/index.js';
import { api } from './services/api.js';
import { Film, Shield, Sparkles } from 'lucide-react';

function MainApp() {
  const { isAdmin } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState<'movies' | 'theatres' | 'bookings' | 'admin'>('movies');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'now-showing' | 'upcoming' | 'all'>('now-showing');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [cities, setCities] = useState<string[]>(['New York', 'Los Angeles', 'Chicago']);

  // Data
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Sub-views
  const [movieForShowtimes, setMovieForShowtimes] = useState<Movie | null>(null);
  const [activeShowForSeats, setActiveShowForSeats] = useState<Show | null>(null);
  const [checkoutPayload, setCheckoutPayload] = useState<{
    show: Show;
    selectedSeats: Seat[];
    snacks: BookingSnack[];
    totalAmount: number;
    subtotal: number;
    convenienceFee: number;
    tax: number;
  } | null>(null);
  const [confirmedBookingForPass, setConfirmedBookingForPass] = useState<Booking | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Load movies and theatres
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          api.getMovies({
            search: searchQuery,
            status: selectedStatus === 'all' ? undefined : selectedStatus,
            genre: selectedGenre !== 'All' ? selectedGenre : undefined,
            format: selectedFormat !== 'All' ? selectedFormat : undefined,
          }),
          api.getTheatres(),
        ]);
        setMovies(moviesRes.movies);
        if (theatresRes.cities && theatresRes.cities.length > 0) {
          setCities(theatresRes.cities);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [searchQuery, selectedStatus, selectedGenre, selectedFormat]);

  const featuredMovie = movies.find(m => m.featured) || movies[0];

  return (
    <div className="relative min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white overflow-x-hidden transition-colors duration-300">
      {/* Ambient Glassmorphic Aurora Mesh Glows (Purple, Pink & Yellow) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Top-right Purple Glow Orb */}
        <div
          className="absolute -top-[12%] right-[-8%] w-[680px] h-[680px] rounded-full bg-gradient-to-br from-purple-600 via-violet-600 to-transparent blur-[140px] aurora-orb-purple"
          style={{ opacity: 'var(--aurora-opacity-purple)' }}
        />
        {/* Left Electric Pink Glow Orb */}
        <div
          className="absolute top-[32%] -left-[10%] w-[720px] h-[720px] rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-600 to-transparent blur-[150px] aurora-orb-pink"
          style={{ opacity: 'var(--aurora-opacity-pink)' }}
        />
        {/* Bottom Sunburst Yellow Glow Orb */}
        <div
          className="absolute -bottom-[8%] right-[22%] w-[640px] h-[640px] rounded-full bg-gradient-to-tl from-yellow-400 via-amber-400 to-transparent blur-[130px] aurora-orb-yellow"
          style={{ opacity: 'var(--aurora-opacity-yellow)' }}
        />
        {/* Fine specular grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(147,51,234,0.08)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* Top Bar Contract (3 Zones) */}
      <div className="relative z-40">
        <Navbar
          activeTab={activeTab}
          setActiveTab={tab => {
            setActiveTab(tab);
            setActiveShowForSeats(null);
          }}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {/* If user is currently picking seats in a show */}
        {activeShowForSeats ? (
          <SeatSelectionView
            showId={activeShowForSeats.id}
            onBack={() => setActiveShowForSeats(null)}
            onProceedToCheckout={payload => setCheckoutPayload(payload)}
          />
        ) : (
          <>
            {/* TAB: MOVIES */}
            {activeTab === 'movies' && (
              <>
                {/* Hero Showcase Banner */}
                <HeroBanner
                  featuredMovie={featuredMovie}
                  onBookMovie={movie => setMovieForShowtimes(movie)}
                  selectedCity={selectedCity}
                  onSelectCity={setSelectedCity}
                  cities={cities}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  {/* Filter segmented controls */}
                  <MovieFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                    selectedGenre={selectedGenre}
                    onGenreChange={setSelectedGenre}
                    selectedFormat={selectedFormat}
                    onFormatChange={setSelectedFormat}
                  />

                  {/* Movies Grid */}
                  {loading ? (
                    <div className="py-24 text-center">
                      <div className="w-12 h-12 border-3 border-pink-500 border-t-yellow-400 rounded-full animate-spin mx-auto mb-3 shadow-[0_0_24px_rgba(236,72,153,0.45)]" />
                      <p className="text-xs text-[var(--text-muted)] font-mono">Loading premiere film catalog...</p>
                    </div>
                  ) : movies.length === 0 ? (
                    <div className="py-20 text-center glass-panel-elevated rounded-3xl p-8 max-w-md mx-auto">
                      <Film className="w-12 h-12 text-pink-500/70 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-[var(--text-primary)]">No movies match your criteria</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1 mb-5">
                        Try adjusting search terms or selecting 'All' in genre and format filters.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedGenre('All');
                          setSelectedFormat('All');
                          setSelectedStatus('all');
                        }}
                        className="px-5 py-2.5 glass-btn-primary rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {movies.map(movie => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          onSelectMovie={m => setMovieForShowtimes(m)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB: THEATRES */}
            {activeTab === 'theatres' && (
              <TheatresView
                onSelectShow={show => setActiveShowForSeats(show)}
                selectedCity={selectedCity}
                onSelectCity={setSelectedCity}
              />
            )}

            {/* TAB: BOOKINGS */}
            {activeTab === 'bookings' && (
              <MyBookingsView onBrowseMovies={() => setActiveTab('movies')} />
            )}

            {/* TAB: ADMIN CONSOLE */}
            {activeTab === 'admin' && (
              isAdmin ? (
                <AdminDashboard />
              ) : (
                <div className="max-w-md mx-auto px-4 py-24 text-center">
                  <div className="p-8 glass-panel-elevated rounded-3xl shadow-2xl">
                    <div className="w-14 h-14 rounded-2xl glass-pill-purple flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-7 h-7 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-display">
                      Administrator Access Required
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                      You are currently signed in as a standard guest. Switch to the Administrator account to manage screenings, audit revenues, and add new films.
                    </p>
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="w-full py-2.5 glass-btn-primary font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Open Demo Switcher
                    </button>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Global Modals */}

      {/* 1. Showtime Selector Modal */}
      {movieForShowtimes && (
        <ShowtimeSelectorModal
          movie={movieForShowtimes}
          selectedCity={selectedCity}
          onClose={() => setMovieForShowtimes(null)}
          onSelectShow={show => {
            setMovieForShowtimes(null);
            setActiveShowForSeats(show);
          }}
        />
      )}

      {/* 2. Checkout & Payment Modal */}
      {checkoutPayload && (
        <CheckoutModal
          show={checkoutPayload.show}
          selectedSeats={checkoutPayload.selectedSeats}
          snacks={checkoutPayload.snacks}
          totalAmount={checkoutPayload.totalAmount}
          subtotal={checkoutPayload.subtotal}
          convenienceFee={checkoutPayload.convenienceFee}
          tax={checkoutPayload.tax}
          onClose={() => setCheckoutPayload(null)}
          onBookingSuccess={booking => {
            setCheckoutPayload(null);
            setActiveShowForSeats(null);
            setConfirmedBookingForPass(booking);
          }}
        />
      )}

      {/* 3. Confirmed Digital Ticket Pass Modal */}
      {confirmedBookingForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/30 backdrop-blur-xl overflow-y-auto">
          <div className="relative w-full max-w-md my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setConfirmedBookingForPass(null);
                setActiveTab('bookings');
              }}
              className="absolute -top-3 -right-3 z-30 p-2.5 glass-panel-elevated text-[var(--text-primary)] rounded-full shadow-xl hover:scale-105 transition-all cursor-pointer"
              aria-label="Close ticket pass"
            >
              ✕
            </button>
            <DigitalTicketPass
              booking={confirmedBookingForPass}
              onClose={() => {
                setConfirmedBookingForPass(null);
                setActiveTab('bookings');
              }}
            />
          </div>
        </div>
      )}

      {/* 4. Auth & Demo Switcher Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Clean Glassmorphic Footer with Purple, Pink & Yellow Accents */}
      <footer className="relative z-10 border-t border-[var(--glass-border-light)] glass-panel mt-auto py-8 px-4 sm:px-6 lg:px-8 text-xs text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
            <div className="w-7 h-7 rounded-lg glass-pill-purple flex items-center justify-center">
              <Film className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-extrabold text-gradient-tri tracking-wider font-display text-sm">IMOVIES</span>
            <span>·</span>
            <span>Cinema Scheduling & Concessions Engine</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="glass-pill-purple px-2.5 py-1 rounded-full font-semibold">IMAX® Laser 4K</span>
            <span className="glass-pill-pink px-2.5 py-1 rounded-full font-semibold">Dolby Cinema™ 64Ch</span>
            <span className="glass-pill-yellow px-2.5 py-1 rounded-full font-semibold">Real-Time Seat Locking</span>
          </div>

          <div className="text-[var(--text-muted)] font-mono text-[11px]">
            © 2026 IMovies Entertainment Systems
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
