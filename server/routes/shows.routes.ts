import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../auth.js';
import { Show, MovieFormat, Seat } from '../../src/types/index.js';

const router = Router();

// GET shows with filters
router.get('/', (req: Request, res: Response): void => {
  const { movieId, theatreId, date, city } = req.query;

  db.cleanExpiredLocks();

  let shows = [...db.shows];

  if (movieId && typeof movieId === 'string') {
    shows = shows.filter(s => s.movieId === movieId);
  }

  if (theatreId && typeof theatreId === 'string') {
    shows = shows.filter(s => s.theatreId === theatreId);
  }

  if (date && typeof date === 'string') {
    shows = shows.filter(s => s.showDate === date);
  }

  if (city && typeof city === 'string' && city !== 'All') {
    shows = shows.filter(s => {
      const t = db.theatres.find(th => th.id === s.theatreId);
      return t && t.city.toLowerCase() === city.toLowerCase();
    });
  }

  // Populate movie and theatre metadata
  const populated = shows.map(s => {
    const movie = db.movies.find(m => m.id === s.movieId);
    const theatre = db.theatres.find(t => t.id === s.theatreId);
    const availableSeatsCount = s.seats.filter(seat => seat.status === 'available').length;
    return {
      id: s.id,
      movieId: s.movieId,
      theatreId: s.theatreId,
      screenNumber: s.screenNumber,
      screenName: s.screenName,
      showDate: s.showDate,
      startTime: s.startTime,
      endTime: s.endTime,
      format: s.format,
      pricing: s.pricing,
      totalSeats: s.seats.length,
      availableSeatsCount,
      movie,
      theatre,
    };
  });

  res.json({ shows: populated });
});

// GET single show with full real-time seat matrix
router.get('/:id', (req: Request, res: Response): void => {
  const show = db.getShowWithDetails(req.params.id);
  if (!show) {
    res.status(404).json({ error: 'Show not found or expired.' });
    return;
  }

  res.json({ show });
});

// Real-time seat lock endpoint (holds seats for 5 minutes during checkout)
router.post('/:id/lock-seats', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { seatIds } = req.body;
  const userId = req.user!.id;

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    res.status(400).json({ error: 'Select at least one seat to reserve.' });
    return;
  }

  db.cleanExpiredLocks(req.params.id);
  const show = db.shows.find(s => s.id === req.params.id);
  if (!show) {
    res.status(404).json({ error: 'Show not found.' });
    return;
  }

  const lockedUntil = Date.now() + 5 * 60 * 1000; // 5 minute lock
  const conflictedSeats: string[] = [];

  for (const seatId of seatIds) {
    const seat = show.seats.find(s => s.id === seatId);
    if (!seat) {
      conflictedSeats.push(seatId);
      continue;
    }

    if (seat.status === 'booked') {
      conflictedSeats.push(seatId);
    } else if (seat.status === 'locked' && seat.lockedBy !== userId && seat.lockedUntil && seat.lockedUntil > Date.now()) {
      conflictedSeats.push(seatId);
    }
  }

  if (conflictedSeats.length > 0) {
    res.status(409).json({
      error: `Seat(s) ${conflictedSeats.join(', ')} were just taken by another user. Please choose different seats.`,
      conflictedSeats,
    });
    return;
  }

  // Lock seats
  for (const seatId of seatIds) {
    const seat = show.seats.find(s => s.id === seatId);
    if (seat) {
      seat.status = 'locked';
      seat.lockedBy = userId;
      seat.lockedUntil = lockedUntil;
    }
  }

  res.json({
    message: 'Seats held successfully for checkout.',
    seatIds,
    lockedUntil,
    expiresInSeconds: 300,
  });
});

// Unlock seats (if user cancels or leaves)
router.post('/:id/unlock-seats', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { seatIds } = req.body;
  const userId = req.user!.id;

  const show = db.shows.find(s => s.id === req.params.id);
  if (!show) {
    res.status(404).json({ error: 'Show not found.' });
    return;
  }

  for (const seat of show.seats) {
    if ((!seatIds || seatIds.includes(seat.id)) && seat.lockedBy === userId && seat.status === 'locked') {
      seat.status = 'available';
      seat.lockedBy = undefined;
      seat.lockedUntil = undefined;
    }
  }

  res.json({ message: 'Seats released.' });
});

// Admin: Schedule new show
router.post('/', adminMiddleware, (req: AuthRequest, res: Response): void => {
  const { movieId, theatreId, screenNumber, showDate, startTime, endTime, format, silverPrice, goldPrice, vipPrice } = req.body;

  if (!movieId || !theatreId || !showDate || !startTime) {
    res.status(400).json({ error: 'Movie, theatre, date, and start time are required.' });
    return;
  }

  const movie = db.movies.find(m => m.id === movieId);
  const theatre = db.theatres.find(t => t.id === theatreId);

  if (!movie || !theatre) {
    res.status(400).json({ error: 'Valid movie and theatre must be selected.' });
    return;
  }

  const sNum = Number(screenNumber) || 1;
  const screen = theatre.screens.find(sc => sc.screenNumber === sNum) || theatre.screens[0];

  const sPrice = Number(silverPrice) || 12.0;
  const gPrice = Number(goldPrice) || 16.0;
  const vPrice = Number(vipPrice) || 22.0;

  // Generate seats
  const seats: Seat[] = [];
  const rows = [
    { row: 'A', type: 'silver' as const, price: sPrice, count: 12 },
    { row: 'B', type: 'silver' as const, price: sPrice, count: 12 },
    { row: 'C', type: 'silver' as const, price: sPrice, count: 12 },
    { row: 'D', type: 'gold' as const, price: gPrice, count: 12 },
    { row: 'E', type: 'gold' as const, price: gPrice, count: 12 },
    { row: 'F', type: 'gold' as const, price: gPrice, count: 12 },
    { row: 'G', type: 'vip' as const, price: vPrice, count: 10 },
    { row: 'H', type: 'vip' as const, price: vPrice, count: 10 },
  ];

  for (const r of rows) {
    for (let num = 1; num <= r.count; num++) {
      seats.push({
        id: `${r.row}${num}`,
        row: r.row,
        number: num,
        type: r.type,
        price: r.price,
        status: 'available',
      });
    }
  }

  const newShow: Show = {
    id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    movieId,
    theatreId,
    screenNumber: screen.screenNumber,
    screenName: screen.name,
    showDate,
    startTime,
    endTime: endTime || '23:30',
    format: (format as MovieFormat) || 'IMAX 3D',
    pricing: {
      silver: sPrice,
      gold: gPrice,
      vip: vPrice,
    },
    seats,
  };

  db.shows.push(newShow);
  res.status(201).json({ show: newShow });
});

// Admin: Delete show
router.delete('/:id', adminMiddleware, (req: AuthRequest, res: Response): void => {
  const index = db.shows.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Show not found.' });
    return;
  }

  const removed = db.shows.splice(index, 1)[0];
  res.json({ message: 'Show cancelled and deleted.', show: removed });
});

export default router;
