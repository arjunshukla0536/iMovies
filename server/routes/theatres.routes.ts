import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { adminMiddleware, AuthRequest } from '../auth.js';
import { Theatre } from '../../src/types/index.js';

const router = Router();

// GET all theatres
router.get('/', (req: Request, res: Response): void => {
  const { city } = req.query;
  let theatres = [...db.theatres];

  if (city && typeof city === 'string' && city !== 'All') {
    theatres = theatres.filter(t => t.city.toLowerCase() === city.toLowerCase());
  }

  // Get list of distinct cities
  const cities = Array.from(new Set(db.theatres.map(t => t.city)));

  res.json({
    cities,
    theatres,
  });
});

// GET single theatre with shows
router.get('/:id', (req: Request, res: Response): void => {
  const theatre = db.theatres.find(t => t.id === req.params.id);
  if (!theatre) {
    res.status(404).json({ error: 'Theatre not found.' });
    return;
  }

  const theatreShows = db.shows
    .filter(s => s.theatreId === theatre.id)
    .map(s => {
      const movie = db.movies.find(m => m.id === s.movieId);
      return {
        ...s,
        movie,
      };
    });

  res.json({
    theatre,
    shows: theatreShows,
  });
});

// Admin: Create theatre
router.post('/', adminMiddleware, (req: AuthRequest, res: Response): void => {
  const { name, city, location, address, totalScreens, screens } = req.body;

  if (!name || !city || !location) {
    res.status(400).json({ error: 'Name, city, and location are required.' });
    return;
  }

  const defaultScreens = [
    { screenNumber: 1, name: 'Main Laser Auditorium', seatingCapacity: 92, type: 'IMAX Laser 4K' },
    { screenNumber: 2, name: 'Dolby Atmos Hall 2', seatingCapacity: 92, type: 'Dolby Atmos Surround' },
  ];

  const newTheatre: Theatre = {
    id: `th_${Date.now()}`,
    name: name.trim(),
    city: city.trim(),
    location: location.trim(),
    address: address || `${location}, ${city}`,
    totalScreens: Number(totalScreens) || (screens ? screens.length : 2),
    screens: screens && Array.isArray(screens) && screens.length > 0 ? screens : defaultScreens,
  };

  db.theatres.push(newTheatre);
  res.status(201).json({ theatre: newTheatre });
});

export default router;
