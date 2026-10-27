import { useState } from 'react';
import { Star, Film, Ticket, Calendar } from 'lucide-react';
import { Movie } from '../types/index.js';

interface MovieCardProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
}

export default function MovieCard({ movie, onSelectMovie }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onSelectMovie(movie)}
      className="group flex flex-col glass-card rounded-3xl overflow-hidden cursor-pointer relative border border-[var(--glass-border-light)] hover:border-[var(--glass-border-highlight)] transition-all duration-300"
    >
      {/* Specular Highlight Top Edge */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-pink-400/30 to-transparent group-hover:via-pink-500/60 transition-colors z-20" />

      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900/40">
        {!imgError ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-purple-900/30 to-pink-900/20">
            <Film className="w-12 h-12 text-pink-400 mb-3" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">{movie.title}</span>
          </div>
        )}

        {/* Ambient Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/90 via-transparent to-transparent opacity-85 group-hover:opacity-65 transition-opacity" />

        {/* Top Floating Glass Badge for Rating (Yellow) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 glass-pill-yellow rounded-xl text-xs font-bold font-mono shadow-md">
          <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>

        {/* Formats and Censor at bottom edge (Pink and Purple) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
          <span className="glass-pill-pink px-2.5 py-1 rounded-lg backdrop-blur-md font-semibold">
            {movie.formats.join(' / ')}
          </span>
          <span className="glass-pill-purple px-2.5 py-1 rounded-lg backdrop-blur-md font-bold">
            {movie.censorRating}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-pink-600 transition-colors line-clamp-1 mb-1.5 font-display">
            {movie.title}
          </h3>

          {/* Clean Unboxed Metadata with Typographic Separators */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-2.5">
            <span className="truncate">{movie.genre.slice(0, 2).join(', ')}</span>
            <span aria-hidden="true" className="text-pink-500/50">·</span>
            <span className="font-mono tabular-nums whitespace-nowrap">{movie.duration}m</span>
            <span aria-hidden="true" className="text-pink-500/50">·</span>
            <span className="whitespace-nowrap">{movie.language}</span>
          </div>

          <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4">
            {movie.tagline || movie.description}
          </p>
        </div>

        {/* Glass Action Button in Purple-Pink-Yellow */}
        <div>
          {movie.isNowShowing ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectMovie(movie);
              }}
              className="w-full py-2.5 px-4 glass-btn-primary rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Showtimes</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectMovie(movie);
              }}
              className="w-full py-2.5 px-4 glass-btn-secondary rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              <span>Premieres {new Date(movie.releaseDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
