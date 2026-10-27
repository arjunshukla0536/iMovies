import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { adminMiddleware, AuthRequest } from '../auth.js';
import { Movie } from '../../src/types/index.js';

const router = Router();

// GET all movies with search & filter
router.get('/', (req: Request, res: Response): void => {
  const { search, genre, language, format, status } = req.query;

  let result = [...db.movies];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      m =>
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.cast.some(c => c.toLowerCase().includes(q)) ||
        m.genre.some(g => g.toLowerCase().includes(q))
    );
  }

  if (genre && typeof genre === 'string' && genre !== 'All') {
    result = result.filter(m => m.genre.includes(genre));
  }

  if (language && typeof language === 'string' && language !== 'All') {
    result = result.filter(m => m.language.toLowerCase() === language.toLowerCase());
  }

  if (format && typeof format === 'string' && format !== 'All') {
    result = result.filter(m => m.formats.includes(format as any));
  }

  if (status === 'now-showing') {
    result = result.filter(m => m.isNowShowing);
  } else if (status === 'upcoming') {
    result = result.filter(m => m.isUpcoming);
  }

  res.json({
    count: result.length,
    movies: result,
  });
});

// GET movie by ID with upcoming showtimes
router.get('/:id', (req: Request, res: Response): void => {
  const movie = db.movies.find(m => m.id === req.params.id);
  if (!movie) {
    res.status(404).json({ error: 'Movie not found.' });
    return;
  }

  const movieShows = db.shows
    .filter(s => s.movieId === movie.id)
    .map(s => {
      const theatre = db.theatres.find(t => t.id === s.theatreId);
      return {
        ...s,
        theatre,
      };
    });

  res.json({
    movie,
    shows: movieShows,
  });
});

// Admin: POST create new movie
router.post('/', adminMiddleware, (req: AuthRequest, res: Response): void => {
  const {
    title,
    tagline,
    description,
    duration,
    genre,
    language,
    releaseDate,
    rating,
    censorRating,
    posterUrl,
    bannerUrl,
    director,
    cast,
    trailerUrl,
    formats,
    isNowShowing,
    isUpcoming,
    featured,
  } = req.body;

  if (!title || !description || !duration) {
    res.status(400).json({ error: 'Title, description, and duration are required.' });
    return;
  }

  const newMovie: Movie = {
    id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    tagline: tagline || '',
    description: description.trim(),
    duration: Number(duration),
    genre: Array.isArray(genre) ? genre : [genre || 'Action'],
    language: language || 'English',
    releaseDate: releaseDate || new Date().toISOString().split('T')[0],
    rating: Number(rating) || 8.0,
    censorRating: censorRating || 'PG-13',
    posterUrl: posterUrl || '/src/assets/images/poster_shadow_protocol_1793005407803.jpg',
    bannerUrl: bannerUrl || posterUrl || '/src/assets/images/poster_shadow_protocol_1793005407803.jpg',
    director: director || 'Visionary Director',
    cast: Array.isArray(cast) ? cast : (typeof cast === 'string' ? cast.split(',').map(s => s.trim()) : ['Leading Star']),
    trailerUrl: trailerUrl || '',
    formats: Array.isArray(formats) && formats.length ? formats : ['2D', '3D'],
    isNowShowing: isNowShowing !== undefined ? Boolean(isNowShowing) : true,
    isUpcoming: Boolean(isUpcoming),
    featured: Boolean(featured),
  };

  db.movies.unshift(newMovie);
  res.status(201).json({ movie: newMovie });
});

// Admin: PUT update movie
router.put('/:id', adminMiddleware, (req: AuthRequest, res: Response): void => {
  const movieIndex = db.movies.findIndex(m => m.id === req.params.id);
  if (movieIndex === -1) {
    res.status(404).json({ error: 'Movie not found.' });
    return;
  }

  const current = db.movies[movieIndex];
  const updated: Movie = {
    ...current,
    ...req.body,
    id: current.id, // Prevent overriding ID
  };

  db.movies[movieIndex] = updated;
  res.json({ movie: updated });
});

// Admin: DELETE movie
router.delete('/:id', adminMiddleware, (req: AuthRequest, res: Response): void => {
  const movieIndex = db.movies.findIndex(m => m.id === req.params.id);
  if (movieIndex === -1) {
    res.status(404).json({ error: 'Movie not found.' });
    return;
  }

  const removed = db.movies.splice(movieIndex, 1)[0];
  // Remove associated shows
  db.shows = db.shows.filter(s => s.movieId !== removed.id);

  res.json({ message: 'Movie and associated show schedules deleted successfully.', movie: removed });
});

export default router;
