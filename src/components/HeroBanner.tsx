import { Play, Sparkles, MapPin } from 'lucide-react';
import { Movie } from '../types/index.js';

interface HeroBannerProps {
  featuredMovie?: Movie;
  onBookMovie: (movie: Movie) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  cities: string[];
}

export default function HeroBanner({
  featuredMovie,
  onBookMovie,
  selectedCity,
  onSelectCity,
  cities,
}: HeroBannerProps) {
  return (
    <div className="relative w-full overflow-hidden border-b border-[var(--glass-border-light)]">
      {/* Background Cinematic Visual with Multi-Layer Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_cinema_hall_1793005405988.jpg"
          alt="Cinema Auditorium"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-25 scale-105 transform motion-safe:transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16 flex flex-col justify-end min-h-[480px]">
        {/* Floating Glass Showcase Panel in Purple-Pink-Yellow Harmony */}
        <div className="max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--glass-border-highlight)] shadow-2xl relative">
          {/* Top highlight glow */}
          <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-pink-500/60 to-transparent" />

          {/* Natural human editorial kicker */}
          <div className="flex items-center gap-3 text-xs tracking-wider uppercase font-bold mb-3 font-mono">
            <span className="glass-pill-purple px-2.5 py-0.5 rounded-lg">Official Premiere Season</span>
            <span aria-hidden="true" className="text-pink-500/50">·</span>
            <span className="text-[var(--text-secondary)] font-medium">IMAX Laser & Dolby Atmos</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.08] mb-4 text-balance drop-shadow-sm text-[var(--text-primary)]">
            {featuredMovie ? featuredMovie.title : 'Shadow Protocol'}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6 line-clamp-3 max-w-xl">
            {featuredMovie
              ? featuredMovie.description
              : 'Experience next-generation cinema sound and curved crystal displays. Choose your preferred luxury recliners, book concessions, and secure tickets in seconds.'}
          </p>

          {/* Frosted Metadata Pill Matrix with Purple, Pink & Yellow Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs mb-8 font-medium">
            <span className="glass-pill-yellow px-2.5 py-1 rounded-xl font-bold font-mono flex items-center gap-1 shadow-sm">
              ★ {featuredMovie?.rating.toFixed(1) || '8.9'}
            </span>
            <span className="glass-pill-pink px-3 py-1 rounded-xl font-semibold">
              {featuredMovie?.genre.slice(0, 3).join(', ') || 'Sci-Fi, Action, Thriller'}
            </span>
            <span className="glass-pill-purple px-3 py-1 rounded-xl font-mono tabular-nums font-semibold">
              {featuredMovie?.duration || 142} min
            </span>
            <span className="glass-pill-yellow px-3 py-1 rounded-xl font-mono font-bold">
              {featuredMovie?.censorRating || 'PG-13'}
            </span>
            <span className="glass-pill px-3 py-1 rounded-xl text-[var(--text-secondary)]">
              {featuredMovie?.language || 'English'}
            </span>
          </div>

          {/* Glass CTA Action Group */}
          <div className="flex flex-wrap items-center gap-4">
            {featuredMovie && (
              <button
                onClick={() => onBookMovie(featuredMovie)}
                className="glass-btn-primary px-6 py-3.5 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Book Tickets & Select Seats</span>
              </button>
            )}

            {featuredMovie?.trailerUrl && (
              <a
                href={featuredMovie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="glass-btn-secondary px-5 py-3.5 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-pink-600" />
                <span>Watch Trailer</span>
              </a>
            )}
          </div>
        </div>

        {/* Quick Location / City Strip with Frosted Glass Styling */}
        <div className="mt-10 p-4 rounded-3xl glass-panel-subtle flex flex-wrap items-center justify-between gap-4 border border-[var(--glass-border-light)]">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
            <div className="w-7 h-7 rounded-xl glass-pill-purple flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-bold text-[var(--text-primary)] font-display">Selected Region:</span>
            <div className="flex flex-wrap items-center gap-1.5 ml-1">
              <button
                onClick={() => onSelectCity('All')}
                className={`px-3 py-1.5 text-xs rounded-xl transition-all cursor-pointer ${
                  selectedCity === 'All'
                    ? 'glass-btn-primary font-bold shadow-sm'
                    : 'glass-pill hover:border-[var(--glass-border-highlight)]'
                }`}
              >
                All Cities
              </button>
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => onSelectCity(city)}
                  className={`px-3 py-1.5 text-xs rounded-xl transition-all cursor-pointer ${
                    selectedCity === city
                      ? 'glass-btn-primary font-bold shadow-sm'
                      : 'glass-pill hover:border-[var(--glass-border-highlight)]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums">
            <span className="glass-pill-purple px-2.5 py-0.5 rounded-lg">4K Laser Projection</span>
            <span className="glass-pill-pink px-2.5 py-0.5 rounded-lg hidden sm:inline">Dolby 64Ch Atmos</span>
            <span className="glass-pill-yellow px-2.5 py-0.5 rounded-lg hidden sm:inline">Zero Waiting Pass</span>
          </div>
        </div>
      </div>
    </div>
  );
}
