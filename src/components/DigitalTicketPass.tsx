import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Printer,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Armchair
} from 'lucide-react';
import { Booking } from '../types/index.js';

interface DigitalTicketPassProps {
  booking: Booking;
  onClose?: () => void;
  onCancelBooking?: (bookingId: string) => void;
}

export default function DigitalTicketPass({
  booking,
  onClose,
  onCancelBooking,
}: DigitalTicketPassProps) {
  const isCancelled = booking.bookingStatus === 'cancelled';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative w-full max-w-md mx-auto my-6 font-sans">
      {/* Luxury Glass Ticket Container */}
      <div className="glass-panel-elevated rounded-3xl overflow-hidden shadow-2xl relative border border-[var(--glass-border-highlight)]">
        {/* Top Header with Purple-Pink-Yellow Liquid Glass */}
        <div className="p-6 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 text-white flex items-center justify-between relative overflow-hidden shadow-md">
          {/* Specular shimmer */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <span className="text-[10px] font-black tracking-widest uppercase opacity-90 block font-mono text-yellow-200">
              Official Cinema Pass
            </span>
            <span className="text-xl font-display font-black uppercase tracking-wider block drop-shadow-sm">
              IMOVIES
            </span>
          </div>

          <div className="text-right relative z-10">
            <span className="text-[10px] uppercase font-mono opacity-90 block font-bold text-yellow-200">
              Booking Ref
            </span>
            <span className="text-sm font-mono font-black tracking-wider block drop-shadow-sm">
              {booking.bookingReference}
            </span>
          </div>
        </div>

        {/* Status banner if cancelled */}
        {isCancelled && (
          <div className="bg-rose-500/15 border-b border-rose-500/30 px-6 py-2.5 flex items-center gap-2 text-rose-400 text-xs backdrop-blur-md">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Booking Cancelled. Full refund issued to original payment.</span>
          </div>
        )}

        {/* Movie Info Section */}
        <div className="p-6 space-y-4">
          <div className="flex gap-4 items-start">
            <img
              src={booking.movie.posterUrl}
              alt={booking.movie.title}
              referrerPolicy="no-referrer"
              className="w-16 h-22 object-cover rounded-2xl shadow-lg border border-[var(--glass-border-highlight)] shrink-0"
            />
            <div className="flex-1">
              <span className="inline-block text-[10px] font-bold font-mono glass-pill-pink px-2 py-0.5 rounded-md mb-1.5">
                {booking.movie.format}
              </span>
              <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug font-display">
                {booking.movie.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {booking.theatre.name} · {booking.theatre.screenName}
              </p>
            </div>
          </div>

          {/* Key Metrics Matrix in Glass */}
          <div className="grid grid-cols-2 gap-3 p-4 glass-panel-subtle rounded-2xl text-xs border border-[var(--glass-border-light)]">
            <div>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-purple-500" />
                Date
              </span>
              <p className="font-bold text-[var(--text-primary)] mt-0.5 font-mono">
                {booking.showDate}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-pink-500" />
                Showtime
              </span>
              <p className="font-bold text-[var(--text-primary)] mt-0.5 font-mono">
                {booking.startTime}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase flex items-center gap-1 font-mono">
                <MapPin className="w-3 h-3 text-yellow-500" />
                Auditorium
              </span>
              <p className="font-bold text-[var(--text-primary)] mt-0.5">
                Screen #{booking.theatre.screenNumber}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase flex items-center gap-1 font-mono">
                <Armchair className="w-3 h-3 text-pink-500" />
                Seats ({booking.seats.length})
              </span>
              <p className="font-bold text-pink-600 mt-0.5 font-mono">
                {booking.seats.map(s => `${s.row}${s.number}`).join(', ')}
              </p>
            </div>
          </div>

          {/* Concessions if any */}
          {booking.snacks && booking.snacks.length > 0 && (
            <div className="p-3.5 glass-panel-subtle rounded-2xl text-xs border border-[var(--glass-border-light)]">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase block mb-1 font-mono">
                Concessions Pre-ordered
              </span>
              <div className="flex flex-wrap gap-2">
                {booking.snacks.map(snack => (
                  <span key={snack.id} className="text-xs glass-pill-yellow px-2.5 py-0.5 rounded-lg font-semibold">
                    {snack.name} (x{snack.quantity})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Perforated Divider with Glass Edge Cutouts */}
        <div className="relative flex items-center justify-between px-2">
          <div className="w-6 h-8 bg-[var(--bg-primary)] rounded-r-full -ml-3 border-r border-y border-[var(--glass-border-light)] backdrop-blur-xl" />
          <div className="flex-1 border-b-2 border-dashed border-pink-400/30 mx-3" />
          <div className="w-6 h-8 bg-[var(--bg-primary)] rounded-l-full -mr-3 border-l border-y border-[var(--glass-border-light)] backdrop-blur-xl" />
        </div>

        {/* Ticket Stub & QR Code Scanner */}
        <div className="p-6 bg-white/[0.04] flex flex-col items-center text-center">
          {/* Dynamic SVG QR code with pink-yellow glow */}
          <div className="p-3.5 bg-white rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.3)] mb-3">
            <svg
              className="w-32 h-32"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" fill="white" />
              <rect x="10" y="10" width="25" height="25" fill="#19102c" />
              <rect x="15" y="15" width="15" height="15" fill="white" />
              <rect x="18" y="18" width="9" height="9" fill="#19102c" />

              <rect x="65" y="10" width="25" height="25" fill="#19102c" />
              <rect x="70" y="15" width="15" height="15" fill="white" />
              <rect x="73" y="18" width="9" height="9" fill="#19102c" />

              <rect x="10" y="65" width="25" height="25" fill="#19102c" />
              <rect x="15" y="70" width="15" height="15" fill="white" />
              <rect x="18" y="73" width="9" height="9" fill="#19102c" />

              <rect x="42" y="14" width="6" height="6" fill="#19102c" />
              <rect x="52" y="14" width="6" height="6" fill="#19102c" />
              <rect x="42" y="24" width="6" height="6" fill="#19102c" />
              <rect x="48" y="32" width="6" height="6" fill="#19102c" />

              <rect x="40" y="44" width="8" height="8" fill="#19102c" />
              <rect x="52" y="44" width="8" height="8" fill="#19102c" />
              <rect x="64" y="44" width="8" height="8" fill="#19102c" />

              <rect x="44" y="60" width="6" height="6" fill="#19102c" />
              <rect x="54" y="66" width="6" height="6" fill="#19102c" />
              <rect x="68" y="62" width="6" height="6" fill="#19102c" />
              <rect x="76" y="72" width="6" height="6" fill="#19102c" />
              <rect x="62" y="80" width="6" height="6" fill="#19102c" />
              <rect x="80" y="82" width="6" height="6" fill="#19102c" />
            </svg>
          </div>

          <p className="text-[11px] font-mono text-[var(--text-secondary)] tracking-wider font-semibold">
            SCAN AT AUDITORIUM ENTRANCE
          </p>

          <div className="flex items-center gap-1.5 text-xs text-emerald-500 mt-2 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Admit {booking.seats.length} Guest{booking.seats.length > 1 ? 's' : ''}</span>
          </div>

          {/* Barcode lines */}
          <div className="w-full flex items-center justify-center gap-0.5 h-6 mt-4 opacity-40">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className={`h-full bg-current ${i % 3 === 0 ? 'w-1' : i % 2 === 0 ? 'w-0.5' : 'w-1.5'}`}
              />
            ))}
          </div>

          <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
            {booking.id}
          </span>
        </div>

        {/* Footer Actions in Glass */}
        <div className="p-4 border-t border-[var(--glass-border-light)] flex flex-wrap items-center justify-between gap-2 bg-white/[0.04]">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl glass-btn-secondary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-purple-600" />
            <span>Print Pass</span>
          </button>

          {!isCancelled && onCancelBooking && (
            <button
              onClick={() => onCancelBooking(booking.id)}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-500 flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-500/20"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Booking</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl glass-btn-primary text-xs font-bold cursor-pointer ml-auto shadow-md"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
