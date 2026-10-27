import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../auth.js';
import { Booking, BookingSnack } from '../../src/types/index.js';

const router = Router();

// GET all bookings of logged-in user
router.get('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  const userId = req.user!.id;
  const userBookings = db.bookings
    .filter(b => b.userId === userId)
    .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

  res.json({ bookings: userBookings });
});

// GET booking by ID (Digital Ticket view)
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  const booking = db.bookings.find(
    b => (b.id === req.params.id || b.bookingReference === req.params.id) &&
         (b.userId === req.user!.id || req.user!.role === 'admin')
  );

  if (!booking) {
    res.status(404).json({ error: 'Ticket booking not found.' });
    return;
  }

  res.json({ booking });
});

// POST create booking (Ticket purchase & Payment processing)
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { showId, seatIds, snacks, paymentMethod } = req.body;
  const user = req.user!;

  if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    res.status(400).json({ error: 'Show ID and at least one seat selection are required.' });
    return;
  }

  const show = db.shows.find(s => s.id === showId);
  if (!show) {
    res.status(404).json({ error: 'Selected show was not found.' });
    return;
  }

  const movie = db.movies.find(m => m.id === show.movieId);
  const theatre = db.theatres.find(t => t.id === show.theatreId);

  if (!movie || !theatre) {
    res.status(400).json({ error: 'Movie or theatre data corrupted for this show.' });
    return;
  }

  // Verify seat availability and ownership of lock
  const selectedSeatObjects = [];
  for (const seatId of seatIds) {
    const seat = show.seats.find(s => s.id === seatId);
    if (!seat) {
      res.status(400).json({ error: `Seat ${seatId} does not exist.` });
      return;
    }

    if (seat.status === 'booked') {
      res.status(409).json({ error: `Seat ${seat.row}${seat.number} has already been booked.` });
      return;
    }

    if (seat.status === 'locked' && seat.lockedBy !== user.id && seat.lockedUntil && seat.lockedUntil > Date.now()) {
      res.status(409).json({ error: `Seat ${seat.row}${seat.number} is currently reserved by another customer.` });
      return;
    }

    selectedSeatObjects.push(seat);
  }

  // Calculate pricing
  const ticketSubtotal = selectedSeatObjects.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = Math.round(selectedSeatObjects.length * 1.75 * 100) / 100;
  const snacksList: BookingSnack[] = Array.isArray(snacks) ? snacks : [];
  const snacksTotal = snacksList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxableAmount = ticketSubtotal + snacksTotal + convenienceFee;
  const tax = Math.round(taxableAmount * 0.08 * 100) / 100; // 8% sales tax
  const totalAmount = Math.round((taxableAmount + tax) * 100) / 100;

  // Finalize seat statuses to 'booked'
  for (const seat of selectedSeatObjects) {
    seat.status = 'booked';
    seat.lockedBy = undefined;
    seat.lockedUntil = undefined;
  }

  // Create booking reference
  const randomRefNum = Math.floor(100000 + Math.random() * 900000);
  const bookingReference = `IM-${randomRefNum}`;
  const bookingId = `bk_${Date.now()}_${randomRefNum}`;
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const newBooking: Booking = {
    id: bookingId,
    bookingReference,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    showId: show.id,
    movie: {
      id: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      duration: movie.duration,
      format: show.format,
    },
    theatre: {
      id: theatre.id,
      name: theatre.name,
      city: theatre.city,
      screenName: show.screenName,
      screenNumber: show.screenNumber,
    },
    showDate: show.showDate,
    startTime: show.startTime,
    seats: selectedSeatObjects.map(s => ({
      row: s.row,
      number: s.number,
      type: s.type,
      price: s.price,
    })),
    snacks: snacksList,
    ticketSubtotal,
    convenienceFee,
    tax,
    totalAmount,
    paymentId,
    paymentMethod: paymentMethod || 'Visa / Mastercard',
    bookingStatus: 'confirmed',
    qrCodeData: `IMOVIES|REF:${bookingReference}|SHOW:${show.id}|SEATS:${selectedSeatObjects.map(s => `${s.row}${s.number}`).join(',')}`,
    bookedAt: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);

  // Send confirmation notification
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: user.id,
    title: 'Ticket Confirmed!',
    message: `Your booking for "${movie.title}" (${selectedSeatObjects.length} seats) is confirmed. Ref: ${bookingReference}`,
    type: 'booking',
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: 'Booking confirmed successfully!',
    booking: newBooking,
  });
});

// POST cancel booking & refund
router.post('/:id/cancel', authMiddleware, (req: AuthRequest, res: Response): void => {
  const user = req.user!;
  const booking = db.bookings.find(
    b => b.id === req.params.id && (b.userId === user.id || user.role === 'admin')
  );

  if (!booking) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  if (booking.bookingStatus === 'cancelled') {
    res.status(400).json({ error: 'This booking has already been cancelled.' });
    return;
  }

  // Release seats in the show
  const show = db.shows.find(s => s.id === booking.showId);
  if (show) {
    for (const bookedSeat of booking.seats) {
      const seat = show.seats.find(s => s.row === bookedSeat.row && s.number === bookedSeat.number);
      if (seat) {
        seat.status = 'available';
        seat.lockedBy = undefined;
        seat.lockedUntil = undefined;
      }
    }
  }

  booking.bookingStatus = 'cancelled';
  booking.refundAmount = booking.totalAmount; // Full refund

  // Send cancellation notification
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: booking.userId,
    title: 'Booking Cancelled',
    message: `Booking #${booking.bookingReference} for "${booking.movie.title}" has been cancelled. Full refund of $${booking.totalAmount.toFixed(2)} processed.`,
    type: 'cancellation',
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.json({
    message: 'Booking successfully cancelled and refund initiated.',
    booking,
  });
});

// Admin: View all bookings
router.get('/admin/all', adminMiddleware, (_req: AuthRequest, res: Response): void => {
  res.json({ bookings: db.bookings });
});

// Admin: Analytics & overview
router.get('/admin/stats', adminMiddleware, (_req: AuthRequest, res: Response): void => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

export default router;
