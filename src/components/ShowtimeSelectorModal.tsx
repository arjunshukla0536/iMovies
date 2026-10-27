import { useState, useEffect } from 'react';
import { X, Clock, Star, MapPin, Film, Play } from 'lucide-react';
import { Movie, Show, Theatre } from '../types/index.js';
import { api } from '../services/api.js';

interface ShowtimeSelectorModalProps {
  movie: Movie;
  onClose: () => void;
  onSelectShow: (show: Show) => void;
  selectedCity: string;
}

export default function ShowtimeSelectorModal({
  movie,
  onClose,
  onSelectShow,
  selectedCity,
}: ShowtimeSelectorModalProps) {
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const sub = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { iso, label, sub };
  });

  const [selectedDate, setSelectedDate] = useState<string>(dates[0].iso);
  const [shows, setShows] = useState<Show[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShowData() {
      setLoading(true);
      try {
        const [showsRes, theatresRes] = await Promise.all([
          api.getShows({
            movieId: movie.id,
            date: selectedDate,
            city: selectedCity !== 'All' ? selectedCity : undefined,
          }),
          api.getTheatres(selectedCity !== 'All' ? selectedCity : undefined),
        ]);
        setShows(showsRes.shows);
        setTheatres(theatresRes.theatres);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchShowData();
  }, [movie.id, selectedDate, selectedCity]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/30 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel-elevated rounded-3xl shadow-2xl overflow-hidden my-8 border border-[var(--glass-border-highlight)] animate-in fade-in zoom-in-95 duration-200">
        {/* Specular Highlight Top Edge */}
        <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-pink-500/60 to-transparent z-30" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 glass-btn-secondary rounded-full cursor-pointer hover:bg-pink-500/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 text-[var(--text-primary)]" />
        </button>

        {/* Header / Movie Hero Header in Glass */}
        <div className="relative p-6 sm:p-8 border-b border-[var(--glass-border-light)] bg-white/[0.04]">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              referrerPolicy="no-referrer"
              className="w-24 sm:w-32 aspect-[3/4] object-cover rounded-2xl shadow-xl border border-[var(--glass-border-highlight)] shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="glass-pill-yellow px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                  {movie.rating.toFixed(1)} / 10
                </span>
                <span className="text-pink-500/50">·</span>
                <span className="text-xs text-[var(--text-secondary)] font-mono glass-pill-purple px-2 py-0.5 rounded-md font-semibold">{movie.duration} mins</span>
                <span className="text-pink-500/50">·</span>
                <span className="text-xs font-mono glass-pill-pink px-2 py-0.5 rounded-md font-bold">{movie.censorRating}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-black text-[var(--text-primary)] mb-2">
                {movie.title}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3">
                {movie.description}
              </p>

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs">
                <div>
                  <span className="text-[var(--text-muted)] font-semibold mr-1.5 font-display">Director:</span>
                  <span className="text-[var(--text-primary)] font-semibold">{movie.director}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] font-semibold mr-1.5 font-display">Cast:</span>
                  <span className="text-[var(--text-primary)] font-semibold">{movie.cast.join(', ')}</span>
                </div>
                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-pink-600 font-bold glass-pill px-2.5 py-0.5 rounded-md hover:scale-105 transition-transform"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch Preview</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="px-6 py-4 glass-panel-subtle border-b border-[var(--glass-border-light)] flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider shrink-0 mr-1 font-mono">
            Date:
          </span>
          {dates.map(d => (
            <button
              key={d.iso}
              onClick={() => setSelectedDate(d.iso)}
              className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all shrink-0 flex flex-col items-center cursor-pointer ${
                selectedDate === d.iso
                  ? 'glass-btn-primary font-bold shadow-md'
                  : 'glass-pill hover:border-[var(--glass-border-highlight)]'
              }`}
            >
              <span className="font-semibold">{d.label}</span>
              <span className="text-[10px] font-mono opacity-80">{d.sub}</span>
            </button>
          ))}
        </div>

        {/* Showtimes List by Theatre */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[460px] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)] font-mono">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-yellow-400 rounded-full animate-spin mx-auto mb-2" />
              Loading available auditorium schedules...
            </div>
          ) : shows.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)] glass-panel-subtle rounded-2xl p-6">
              <Film className="w-10 h-10 text-pink-500/60 mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">No showtimes found for this date</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Try selecting a different date or choose "All Cities" in the region selector.
              </p>
            </div>
          ) : (
            theatres.map(theatre => {
              const theatreShows = shows.filter(s => s.theatreId === theatre.id);
              if (theatreShows.length === 0) return null;

              return (
                <div
                  key={theatre.id}
                  className="p-5 glass-panel rounded-2xl space-y-4 border border-[var(--glass-border-light)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--glass-border-light)] pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 font-display">
                        {theatre.name}
                        <span className="text-[11px] text-pink-600 font-mono font-normal">
                          ({theatre.city})
                        </span>
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-purple-500" />
                        {theatre.location}
                      </p>
                    </div>

                    <div className="text-xs text-[var(--text-secondary)] flex items-center gap-3 font-mono">
                      <span>Silver <span className="text-purple-600 font-bold">$12</span></span>
                      <span>·</span>
                      <span>Gold <span className="text-pink-600 font-bold">$16</span></span>
                      <span>·</span>
                      <span>VIP <span className="text-yellow-600 font-bold">$21+</span></span>
                    </div>
                  </div>

                  {/* Showtimes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {theatreShows.map(show => (
                      <button
                        key={show.id}
                        onClick={() => onSelectShow(show)}
                        className="group flex flex-col items-center p-3 rounded-2xl glass-card text-center cursor-pointer border border-[var(--glass-border-light)] hover:border-pink-500/60 hover:scale-[1.02] transition-all"
                      >
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)] group-hover:text-pink-600 font-mono transition-colors">
                          <Clock className="w-3.5 h-3.5 text-pink-500" />
                          <span>{show.startTime}</span>
                        </div>
                        <span className="text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] mt-1 font-medium">
                          {show.format}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {show.screenName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
