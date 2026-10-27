import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Clock,
  Armchair,
  ShoppingBag,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';
import { Show, Seat, BookingSnack } from '../types/index.js';
import { api } from '../services/api.js';
import { useNotifications } from '../context/NotificationContext.js';

interface SeatSelectionViewProps {
  showId: string;
  onBack: () => void;
  onProceedToCheckout: (payload: {
    show: Show;
    selectedSeats: Seat[];
    snacks: BookingSnack[];
    totalAmount: number;
    subtotal: number;
    convenienceFee: number;
    tax: number;
  }) => void;
}

const SNACKS_MENU = [
  {
    id: 'snk_popcorn',
    name: 'Jumbo Butter Popcorn',
    desc: 'Freshly popped warm buttery crunch',
    price: 8.5,
    emoji: '🍿',
  },
  {
    id: 'snk_caramel',
    name: 'Gourmet Caramel Corn',
    desc: 'Artisanal kettle glazed sweet crunch',
    price: 9.5,
    emoji: '🍯',
  },
  {
    id: 'snk_nachos',
    name: 'Loaded Stadium Nachos',
    desc: 'Crisp tortilla chips with jalapeño queso',
    price: 7.5,
    emoji: '🧀',
  },
  {
    id: 'snk_cola',
    name: 'Ice-Cold Fountain Soda',
    desc: 'Coca-Cola, Sprite or Zero Sugar 32oz',
    price: 5.0,
    emoji: '🥤',
  },
  {
    id: 'snk_combo',
    name: 'Premiere Duo Combo',
    desc: '1 Jumbo Popcorn + 2 Large Sodas',
    price: 16.0,
    emoji: '✨',
  },
];

export default function SeatSelectionView({
  showId,
  onBack,
  onProceedToCheckout,
}: SeatSelectionViewProps) {
  const { showToast } = useNotifications();

  const [show, setShow] = useState<Show | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [snacksCart, setSnacksCart] = useState<Record<string, number>>({});
  const [showSnacksModal, setShowSnacksModal] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState<number | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [loading, setLoading] = useState(true);

  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch show seat map
  const fetchShowData = useCallback(async () => {
    try {
      const res = await api.getShowById(showId);
      setShow(res.show);
    } catch {
      showToast('Failed to load real-time seat configuration', 'error');
    } finally {
      setLoading(false);
    }
  }, [showId, showToast]);

  useEffect(() => {
    fetchShowData();
    const pollInterval = setInterval(fetchShowData, 8000);
    return () => clearInterval(pollInterval);
  }, [fetchShowData]);

  // Handle countdown timer for locked seats
  useEffect(() => {
    if (lockTimeRemaining === null) return;
    if (lockTimeRemaining <= 0) {
      showToast('Reservation session timed out. Seats released.', 'info');
      setSelectedSeatIds([]);
      setLockTimeRemaining(null);
      fetchShowData();
      return;
    }

    lockTimerRef.current = setTimeout(() => {
      setLockTimeRemaining(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [lockTimeRemaining, fetchShowData, showToast]);

  // Unlock seats if user navigates back
  const handleBack = async () => {
    if (selectedSeatIds.length > 0) {
      await api.unlockSeats(showId, selectedSeatIds);
    }
    onBack();
  };

  // Toggle seat selection
  const toggleSeat = async (seat: Seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') {
      showToast('This seat is reserved or being booked by another guest.', 'error');
      return;
    }

    const isAlreadySelected = selectedSeatIds.includes(seat.id);
    let nextSelected: string[];

    if (isAlreadySelected) {
      nextSelected = selectedSeatIds.filter(id => id !== seat.id);
    } else {
      if (selectedSeatIds.length >= 8) {
        showToast('Maximum 8 tickets allowed per order.', 'info');
        return;
      }
      nextSelected = [...selectedSeatIds, seat.id];
    }

    setSelectedSeatIds(nextSelected);

    if (nextSelected.length > 0) {
      try {
        setIsLocking(true);
        const lockRes = await api.lockSeats(showId, nextSelected);
        setLockTimeRemaining(lockRes.expiresInSeconds);
      } catch (err: any) {
        showToast(err.message || 'Seat was just taken by another user.', 'error');
        fetchShowData();
        setSelectedSeatIds([]);
        setLockTimeRemaining(null);
      } finally {
        setIsLocking(false);
      }
    } else {
      await api.unlockSeats(showId);
      setLockTimeRemaining(null);
    }
  };

  // Snack quantity update
  const updateSnackQty = (id: string, delta: number) => {
    setSnacksCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  if (loading || !show) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-3 border-pink-500 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4 shadow-[0_0_24px_rgba(236,72,153,0.45)]" />
        <p className="text-sm font-semibold text-[var(--text-secondary)] font-mono">Setting up auditorium glass projection...</p>
      </div>
    );
  }

  // Calculate totals
  const selectedSeats = show.seats.filter(s => selectedSeatIds.includes(s.id));
  const ticketSubtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const snacksList: BookingSnack[] = Object.entries(snacksCart).map(([id, qty]) => {
    const item = SNACKS_MENU.find(m => m.id === id)!;
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: qty,
    };
  });

  const snacksSubtotal = snacksList.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const convenienceFee = selectedSeats.length > 0 ? Math.round(selectedSeats.length * 1.75 * 100) / 100 : 0;
  const taxable = ticketSubtotal + snacksSubtotal + convenienceFee;
  const tax = Math.round(taxable * 0.08 * 100) / 100;
  const grandTotal = Math.round((taxable + tax) * 100) / 100;

  // Group seats by row
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Navigation Bar & Show Meta in Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--glass-border-light)] mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-3 rounded-2xl glass-btn-secondary transition-all cursor-pointer"
            aria-label="Back to movies"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider font-mono">
              <span className="glass-pill-purple px-2 py-0.5 rounded-md font-bold">{show.theatre?.name}</span>
              <span className="text-pink-500">·</span>
              <span className="text-[var(--text-secondary)]">{show.screenName}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-[var(--text-primary)] mt-1">
              {show.movie?.title}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {new Date(show.showDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at{' '}
              <span className="text-pink-600 font-mono font-bold">{show.startTime}</span> ({show.format})
            </p>
          </div>
        </div>

        {/* Lock Expiration Countdown in Glass Pill */}
        {lockTimeRemaining !== null && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass-pill-yellow shadow-lg">
            <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
            <div className="text-xs">
              <span className="font-medium text-[var(--text-primary)]">Seats Held: </span>
              <span className="font-mono font-bold tabular-nums text-sm">
                {Math.floor(lockTimeRemaining / 60)}:
                {String(lockTimeRemaining % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cinema Seating Grid in Frosted Glass Panel */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden border border-[var(--glass-border-highlight)]">
          {/* Top highlight glow */}
          <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

          {/* Cinema Screen Curved Projection in Purple-Pink-Yellow */}
          <div className="w-full max-w-lg mb-12 flex flex-col items-center">
            <div className="w-full h-3 rounded-[50%] bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 shadow-[0_0_36px_rgba(236,72,153,0.55)] mb-2" />
            <div className="w-3/4 h-8 bg-gradient-to-b from-pink-500/15 to-transparent blur-md -mt-2 mb-1" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)] font-bold glass-pill px-3 py-0.5 rounded-full">
              Curved Screen · Auditorium Front
            </span>
          </div>

          {/* Seat Grid Rows */}
          <div className="w-full max-w-xl space-y-3.5 mb-10 overflow-x-auto pb-4">
            {rows.map(rowLetter => {
              const rowSeats = show.seats.filter(s => s.row === rowLetter);
              const tierType = rowSeats[0]?.type || 'silver';

              return (
                <div key={rowLetter} className="flex items-center justify-center gap-2 sm:gap-3">
                  {/* Left row indicator */}
                  <span className="w-5 text-center text-xs font-mono font-bold text-[var(--text-muted)] select-none">
                    {rowLetter}
                  </span>

                  {/* Seat items */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {rowSeats.map((seat, index) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isBooked = seat.status === 'booked';
                      const isLocked = seat.status === 'locked' && !isSelected;

                      // Aisle gap in middle
                      const hasAisleGap = index === Math.floor(rowSeats.length / 2);

                      return (
                        <div key={seat.id} className="flex items-center">
                          {hasAisleGap && <div className="w-4 sm:w-6" />}
                          <button
                            type="button"
                            disabled={isBooked || isLocked || isLocking}
                            onClick={() => toggleSeat(seat)}
                            title={`Row ${seat.row}, Seat ${seat.number} (${seat.type.toUpperCase()}) - $${seat.price.toFixed(2)}`}
                            className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'glass-btn-primary shadow-lg shadow-pink-500/50 scale-110 z-10 font-black'
                                : isBooked
                                ? 'opacity-25 cursor-not-allowed border border-slate-400/20'
                                : isLocked
                                ? 'bg-rose-500/15 text-rose-400 cursor-not-allowed border border-rose-500/30'
                                : tierType === 'vip'
                                ? 'glass-pill-yellow hover:scale-105'
                                : tierType === 'gold'
                                ? 'glass-pill-pink hover:scale-105'
                                : 'glass-pill-purple hover:scale-105'
                            }`}
                          >
                            {seat.number}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right row indicator */}
                  <span className="w-5 text-center text-xs font-mono font-bold text-[var(--text-muted)] select-none">
                    {rowLetter}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Seat Status Legend in Glass Pill Matrix */}
          <div className="w-full pt-6 border-t border-[var(--glass-border-light)] flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-secondary)] font-mono">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg glass-pill-purple" />
              <span>Silver ($12)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg glass-pill-pink" />
              <span>Gold ($16)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg glass-pill-yellow" />
              <span>VIP ($21+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg glass-btn-primary shadow-sm" />
              <span className="font-bold text-[var(--text-primary)]">Selected</span>
            </div>
          </div>
        </div>

        {/* Sidebar Order Summary & Snacks Add-on in Glass Card */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-5 border border-[var(--glass-border-highlight)]">
            <div className="flex items-center justify-between border-b border-[var(--glass-border-light)] pb-4">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-display">Booking Summary</h3>
              <span className="text-xs font-mono glass-pill-purple px-2.5 py-0.5 rounded-full font-bold">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'ticket' : 'tickets'}
              </span>
            </div>

            {selectedSeats.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)] flex flex-col items-center glass-panel-subtle rounded-2xl p-4">
                <Armchair className="w-8 h-8 text-pink-500/60 mb-2" />
                <p>Click on the seating map above to reserve your cinema seats.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Seats list chips */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeats.map(s => (
                    <span
                      key={s.id}
                      className="px-2.5 py-1 rounded-xl glass-pill-yellow text-xs font-mono font-bold"
                    >
                      {s.row}{s.number} (${s.price.toFixed(2)})
                    </span>
                  ))}
                </div>

                {/* Line items in Frosted Container */}
                <div className="p-3.5 rounded-2xl glass-panel-subtle space-y-2 text-xs font-mono tabular-nums border border-[var(--glass-border-light)]">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Tickets Subtotal</span>
                    <span className="text-[var(--text-primary)] font-bold">${ticketSubtotal.toFixed(2)}</span>
                  </div>

                  {snacksSubtotal > 0 && (
                    <div className="flex justify-between text-pink-600">
                      <span>Concessions ({snacksList.reduce((acc, s) => acc + s.quantity, 0)})</span>
                      <span className="font-bold">+${snacksSubtotal.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Convenience Fee</span>
                    <span>${convenienceFee.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Tax & Surcharges (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-[var(--text-primary)] pt-2.5 border-t border-[var(--glass-border-light)] font-sans">
                    <span className="font-display">Total Due</span>
                    <span className="text-gradient-tri font-mono font-black text-lg">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Concessions Button */}
                <button
                  type="button"
                  onClick={() => setShowSnacksModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl glass-btn-secondary text-xs font-semibold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-pink-500" />
                    <span>Concessions & Snacks</span>
                  </div>
                  <span className="text-pink-600 font-mono font-bold">
                    {snacksSubtotal > 0 ? `+$${snacksSubtotal.toFixed(2)}` : 'Add Popcorn & Drinks →'}
                  </span>
                </button>

                {/* Primary Proceed Button */}
                <button
                  type="button"
                  disabled={selectedSeats.length === 0}
                  onClick={() =>
                    onProceedToCheckout({
                      show,
                      selectedSeats,
                      snacks: snacksList,
                      totalAmount: grandTotal,
                      subtotal: ticketSubtotal,
                      convenienceFee,
                      tax,
                    })
                  }
                  className="w-full py-3.5 px-4 rounded-2xl glass-btn-primary disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm cursor-pointer shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Proceed to Payment (${grandTotal.toFixed(2)})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Concessions Modal in Elevated Glass */}
      {showSnacksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/30 backdrop-blur-xl">
          <div className="w-full max-w-lg glass-panel-elevated rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-[var(--glass-border-highlight)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--glass-border-light)] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">Cinema Concessions</h3>
                <p className="text-xs text-[var(--text-secondary)]">Fresh artisanal snacks delivered straight to your cinema seat</p>
              </div>
              <button
                onClick={() => setShowSnacksModal(false)}
                className="glass-btn-secondary p-2 rounded-full cursor-pointer hover:bg-pink-500/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {SNACKS_MENU.map(snack => {
                const qty = snacksCart[snack.id] || 0;
                return (
                  <div
                    key={snack.id}
                    className="p-3.5 glass-panel-subtle rounded-2xl flex items-center justify-between gap-4 border border-[var(--glass-border-light)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2.5 rounded-2xl glass-panel-subtle">{snack.emoji}</span>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">{snack.name}</h4>
                        <p className="text-[11px] text-[var(--text-secondary)]">{snack.desc}</p>
                        <span className="text-xs font-mono font-bold text-pink-600 mt-0.5 block">
                          ${snack.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 glass-pill p-1 rounded-xl border border-[var(--glass-border-light)]">
                      <button
                        onClick={() => updateSnackQty(snack.id, -1)}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 rounded-lg transition-colors"
                        disabled={qty === 0}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold text-[var(--text-primary)]">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateSnackQty(snack.id, 1)}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border-light)]">
              <div className="text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Concessions Total: </span>
                <span className="font-bold text-gradient-tri text-sm">
                  ${snacksSubtotal.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setShowSnacksModal(false)}
                className="px-6 py-2.5 glass-btn-primary font-bold text-xs rounded-xl cursor-pointer shadow-md"
              >
                Confirm Concessions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
