import { useState, useEffect } from 'react';
import {
  Ticket,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Booking } from '../types/index.js';
import { api } from '../services/api.js';
import { useNotifications } from '../context/NotificationContext.js';
import DigitalTicketPass from './DigitalTicketPass.js';

interface MyBookingsViewProps {
  onBrowseMovies: () => void;
}

export default function MyBookingsView({ onBrowseMovies }: MyBookingsViewProps) {
  const { showToast } = useNotifications();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getMyBookings();
      setBookings(res.bookings);
    } catch {
      showToast('Failed to load your booking records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;
    try {
      setIsCancelling(true);
      const res = await api.cancelBooking(bookingToCancel.id);
      showToast('Booking cancelled. Full refund has been issued.', 'success');
      setBookings(prev =>
        prev.map(b => (b.id === res.booking.id ? res.booking : b))
      );
      if (selectedBookingForPass?.id === res.booking.id) {
        setSelectedBookingForPass(res.booking);
      }
      setBookingToCancel(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const nowIso = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(
    b => b.bookingStatus === 'confirmed' && b.showDate >= nowIso
  );

  const pastOrCancelledBookings = bookings.filter(
    b => b.bookingStatus === 'cancelled' || b.showDate < nowIso
  );

  const currentList = activeTab === 'upcoming' ? upcomingBookings : pastOrCancelledBookings;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
            My Cinema Bookings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Access your digital tickets, seat admissions, and past transaction records.
          </p>
        </div>

        {/* Tab Controls in Frosted Glass Capsule */}
        <div className="flex items-center p-1.5 glass-panel rounded-2xl border border-[var(--glass-border-light)] self-start sm:self-auto shadow-md gap-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'glass-btn-primary text-white font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'glass-btn-primary text-white font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Past & Cancelled ({pastOrCancelledBookings.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-2 border-[#ec4899] border-t-transparent rounded-full animate-spin mx-auto mb-3 shadow-[0_0_20px_rgba(236,72,153,0.3)]" />
          <p className="text-xs text-[var(--text-muted)] font-mono">Loading your tickets...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="py-20 text-center glass-panel-elevated rounded-3xl p-8 max-w-lg mx-auto border border-[var(--glass-border-light)]">
          <Ticket className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
            No {activeTab} bookings found
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-6">
            {activeTab === 'upcoming'
              ? 'You do not have any upcoming movie screenings booked.'
              : 'You have no past or cancelled bookings in your history.'}
          </p>
          <button
            onClick={onBrowseMovies}
            className="px-6 py-2.5 glass-btn-primary font-bold text-xs rounded-xl cursor-pointer shadow-md text-white"
          >
            Browse Movies & Book Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map(booking => {
            const isCancelled = booking.bookingStatus === 'cancelled';

            return (
              <div
                key={booking.id}
                className="p-5 sm:p-6 glass-card rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
              >
                {/* Specular Highlight Line */}
                <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="flex gap-4 items-start sm:items-center">
                  <img
                    src={booking.movie.posterUrl}
                    alt={booking.movie.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-22 object-cover rounded-2xl shadow-lg border border-white/20 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold glass-pill-pink px-2 py-0.5 rounded-md">
                        {booking.movie.format}
                      </span>
                      <span className="text-xs font-mono text-[var(--text-secondary)]">
                        Ref: <span className="text-[var(--text-primary)] font-bold">{booking.bookingReference}</span>
                      </span>
                      {isCancelled ? (
                        <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md">
                          Cancelled (Refunded)
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          Confirmed
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                      {booking.movie.title}
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {booking.theatre.name} ({booking.theatre.city}) · {booking.theatre.screenName}
                    </p>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[var(--text-secondary)] mt-2 font-mono">
                      <span className="flex items-center gap-1.5 glass-pill px-2 py-0.5 rounded-md">
                        <Calendar className="w-3.5 h-3.5 text-pink-500" />
                        {booking.showDate}
                      </span>
                      <span className="flex items-center gap-1.5 glass-pill px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        {booking.startTime}
                      </span>
                      <span className="glass-pill-yellow font-bold px-2 py-0.5 rounded-md">
                        Seats: {booking.seats.map(s => `${s.row}${s.number}`).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-[var(--glass-border-light)]">
                  <div className="text-left md:text-right font-mono tabular-nums">
                    <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-semibold">
                      Total Paid
                    </span>
                    <span className="text-lg font-bold text-gradient-tri">
                      ${booking.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBookingForPass(booking)}
                      className="px-4 py-2 glass-btn-primary text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm text-white"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Digital Pass</span>
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => setBookingToCancel(booking)}
                        className="px-3.5 py-2 glass-btn-secondary text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-medium rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Pass Modal */}
      {selectedBookingForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl overflow-y-auto">
          <div className="relative w-full max-w-md my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedBookingForPass(null)}
              className="absolute -top-3 -right-3 z-30 p-2.5 glass-panel-elevated text-[var(--text-primary)] rounded-full shadow-lg hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Close pass view"
            >
              ✕
            </button>
            <DigitalTicketPass
              booking={selectedBookingForPass}
              onClose={() => setSelectedBookingForPass(null)}
              onCancelBooking={id => {
                const b = bookings.find(item => item.id === id);
                if (b) setBookingToCancel(b);
              }}
            />
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Dialog in Elevated Glass */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
          <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 border border-[var(--glass-border-highlight)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-display">Cancel Booking?</h3>
                <p className="text-[11px] text-[var(--text-secondary)]">Action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to cancel booking #{bookingToCancel.bookingReference} for{' '}
              <span className="font-semibold text-[var(--text-primary)]">"{bookingToCancel.movie.title}"</span>?
            </p>

            <div className="p-3.5 glass-panel-subtle rounded-2xl border border-[var(--glass-border-light)] text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Seats to release:</span>
                <span className="text-[var(--text-primary)] font-bold">
                  {bookingToCancel.seats.map(s => `${s.row}${s.number}`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Full Refund Amount:</span>
                <span className="text-emerald-600 font-bold">
                  ${bookingToCancel.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                disabled={isCancelling}
                onClick={() => setBookingToCancel(null)}
                className="px-4 py-2 glass-btn-secondary text-xs font-medium rounded-xl cursor-pointer"
              >
                Keep Tickets
              </button>
              <button
                disabled={isCancelling}
                onClick={handleCancelConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                {isCancelling ? 'Processing Refund...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
