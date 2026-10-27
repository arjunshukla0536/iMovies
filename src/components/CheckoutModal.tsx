import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Lock, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Show, Seat, BookingSnack, Booking } from '../types/index.js';
import { api } from '../services/api.js';
import { useNotifications } from '../context/NotificationContext.js';

interface CheckoutModalProps {
  show: Show;
  selectedSeats: Seat[];
  snacks: BookingSnack[];
  totalAmount: number;
  subtotal: number;
  convenienceFee: number;
  tax: number;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export default function CheckoutModal({
  show,
  selectedSeats,
  snacks,
  totalAmount,
  subtotal,
  convenienceFee,
  tax,
  onClose,
  onBookingSuccess,
}: CheckoutModalProps) {
  const { showToast, refreshNotifications } = useNotifications();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'upi'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('Alex Mercer');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('892');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await new Promise(res => setTimeout(res, 1200));

      const payload = {
        showId: show.id,
        seatIds: selectedSeats.map(s => s.id),
        snacks,
        paymentMethod:
          paymentMethod === 'card'
            ? `Credit Card (${cardNumber.slice(-4)})`
            : paymentMethod === 'applepay'
            ? 'Apple Pay / Digital Wallet'
            : 'Instant UPI / Bank Transfer',
      };

      const res = await api.createBooking(payload);

      // Trigger celebratory confetti in purple, pink, and yellow!
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#facc15', '#ffffff'],
      });

      showToast('Booking confirmed! Your digital pass is ready.', 'success');
      await refreshNotifications();
      onBookingSuccess(res.booking);
    } catch (err: any) {
      showToast(err.message || 'Payment processing encountered an error.', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/30 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-3xl shadow-2xl overflow-hidden my-8 border border-[var(--glass-border-highlight)] animate-in fade-in zoom-in-95 duration-200">
        {/* Specular Highlight Top Edge */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-pink-500/60 to-transparent z-20" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[var(--glass-border-light)] flex items-center justify-between bg-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl glass-pill-purple flex items-center justify-center">
              <Lock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-display">Secure Cinema Checkout</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">Encrypted TLS 1.3 Booking Channel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="glass-btn-secondary p-2 rounded-full cursor-pointer hover:bg-pink-500/10 transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-4 h-4 text-[var(--text-primary)]" />
          </button>
        </div>

        <form onSubmit={handlePay} className="p-6 space-y-6">
          {/* Order Details Preview Box */}
          <div className="p-4 rounded-2xl glass-panel-subtle border border-[var(--glass-border-light)] space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] font-display">{show.movie?.title}</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  {show.theatre?.name} · {show.screenName}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                  {show.showDate} at <span className="text-pink-600 font-bold">{show.startTime}</span> ({show.format})
                </p>
              </div>
              <span className="text-xs font-mono font-bold glass-pill-purple px-2.5 py-1 rounded-lg">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
              </span>
            </div>

            <div className="pt-3 border-t border-[var(--glass-border-light)] text-xs text-[var(--text-secondary)] font-mono space-y-1.5 tabular-nums">
              <div className="flex justify-between">
                <span>Seats ({selectedSeats.map(s => `${s.row}${s.number}`).join(', ')})</span>
                <span className="text-[var(--text-primary)] font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              {snacks.length > 0 && (
                <div className="flex justify-between text-pink-600">
                  <span>Concessions ({snacks.map(s => `${s.name} x${s.quantity}`).join(', ')})</span>
                  <span className="font-bold">+${snacks.reduce((a, b) => a + b.price * b.quantity, 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Convenience & Booking Fee</span>
                <span>${convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Surcharges (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[var(--text-primary)] pt-2.5 border-t border-[var(--glass-border-light)] font-sans">
                <span className="font-display">Total Due</span>
                <span className="text-gradient-tri font-mono text-lg font-black">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector in Frosted Glass Capsule */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-2 font-display">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'glass-pill-purple font-bold shadow-sm border border-purple-500/50'
                    : 'glass-panel-subtle text-[var(--text-secondary)] hover:border-[var(--glass-border-highlight)]'
                }`}
              >
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Credit / Debit</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('applepay')}
                className={`p-3 rounded-2xl text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'applepay'
                    ? 'glass-pill-pink font-bold shadow-sm border border-pink-500/50'
                    : 'glass-panel-subtle text-[var(--text-secondary)] hover:border-[var(--glass-border-highlight)]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-pink-600" />
                <span>Digital Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'glass-pill-yellow font-bold shadow-sm border border-yellow-500/50'
                    : 'glass-panel-subtle text-[var(--text-secondary)] hover:border-[var(--glass-border-highlight)]'
                }`}
              >
                <Check className="w-4 h-4 text-yellow-600" />
                <span>Instant UPI</span>
              </button>
            </div>
          </div>

          {/* Payment Fields with Purple-Pink-Yellow Holographic Glass Feel */}
          {paymentMethod === 'card' && (
            <div className="space-y-3.5 glass-panel-subtle p-5 rounded-2xl border border-[var(--glass-border-light)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1 font-mono">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs font-mono focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1 font-mono">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1 font-mono">
                      Expires
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs font-mono focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1 font-mono">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs font-mono focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trust badge */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] glass-panel-subtle p-2.5 rounded-xl border border-[var(--glass-border-light)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>256-bit encrypted bank checkout. Instant ticket confirmation.</span>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-2xl glass-btn-primary disabled:opacity-50 font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authorizing Payment...</span>
              </>
            ) : (
              <span>Complete Payment (${totalAmount.toFixed(2)})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
