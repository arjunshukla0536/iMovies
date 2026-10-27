import { useState, useEffect } from 'react';
import { MapPin, Film, ScreenShare, Clock, Calendar, Sparkles } from 'lucide-react';
import { Theatre, Show } from '../types/index.js';
import { api } from '../services/api.js';

interface TheatresViewProps {
  onSelectShow: (show: Show) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export default function TheatresView({
  onSelectShow,
  selectedCity,
  onSelectCity,
}: TheatresViewProps) {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [theatreShows, setTheatreShows] = useState<Record<string, Show[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTheatresData() {
      setLoading(true);
      try {
        const res = await api.getTheatres(selectedCity !== 'All' ? selectedCity : undefined);
        setTheatres(res.theatres);
        setCities(res.cities);

        const todayIso = new Date().toISOString().split('T')[0];
        const showsRes = await api.getShows({
          city: selectedCity !== 'All' ? selectedCity : undefined,
          date: todayIso,
        });

        const showMap: Record<string, Show[]> = {};
        for (const show of showsRes.shows) {
          if (!showMap[show.theatreId]) {
            showMap[show.theatreId] = [];
          }
          showMap[show.theatreId].push(show);
        }
        setTheatreShows(showMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTheatresData();
  }, [selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
            Cinema Theatres & Auditoriums
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Explore multiplex locations, laser projection tech, and today's premier screening schedules.
          </p>
        </div>

        {/* City Filter Segment in Glass Capsule */}
        <div className="flex items-center gap-1.5 p-1.5 glass-panel rounded-2xl border border-[var(--glass-border-light)] self-start sm:self-auto shadow-md">
          <button
            onClick={() => onSelectCity('All')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              selectedCity === 'All'
                ? 'glass-btn-primary font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            All Cities
          </button>
          {cities.map(c => (
            <button
              key={c}
              onClick={() => onSelectCity(c)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                selectedCity === c
                  ? 'glass-btn-primary font-bold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-3 border-pink-500 border-t-yellow-400 rounded-full animate-spin mx-auto mb-3 shadow-[0_0_24px_rgba(236,72,153,0.45)]" />
          <p className="text-xs text-[var(--text-muted)] font-mono">Loading cinema locations...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {theatres.map(theatre => {
            const currentShows = theatreShows[theatre.id] || [];

            return (
              <div
                key={theatre.id}
                className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-[var(--glass-border-light)] hover:border-[var(--glass-border-highlight)] transition-colors"
              >
                {/* Top Specular Accent */}
                <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--glass-border-light)] pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 text-xs font-mono font-bold">
                      <span className="glass-pill-purple px-2 py-0.5 rounded-md flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-purple-600" />
                        {theatre.city}
                      </span>
                      <span className="text-pink-500">·</span>
                      <span className="text-[var(--text-secondary)]">{theatre.totalScreens} Auditoriums</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--text-primary)]">
                      {theatre.name}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{theatre.address}</p>
                  </div>

                  {/* Auditoriums badges */}
                  <div className="flex flex-wrap gap-2">
                    {theatre.screens.map(screen => (
                      <div
                        key={screen.screenNumber}
                        className="px-3 py-1.5 glass-panel-subtle rounded-xl text-[11px] font-mono border border-[var(--glass-border-light)]"
                      >
                        <span className="text-pink-600 font-bold">#{screen.screenNumber}</span> {screen.type}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Shows at this Theatre */}
                <div className="pt-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 font-mono">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span>Today's Premier Showtimes</span>
                  </div>

                  {currentShows.length === 0 ? (
                    <div className="glass-panel-subtle p-6 rounded-2xl text-center text-xs text-[var(--text-muted)] italic">
                      No more shows scheduled for today at this venue. Check tomorrow's schedule in Movies catalog.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {currentShows.map(show => (
                        <div
                          key={show.id}
                          onClick={() => onSelectShow(show)}
                          className="p-4 sm:p-5 glass-card rounded-2xl cursor-pointer group flex flex-col justify-between border border-[var(--glass-border-light)] hover:border-pink-500/60"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-mono font-bold glass-pill-pink px-2 py-0.5 rounded-md text-[10px]">
                                {show.format}
                              </span>
                              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                                {show.availableSeatsCount} seats left
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-pink-600 transition-colors line-clamp-1 font-display">
                              {show.movie?.title}
                            </h4>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{show.screenName}</p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[var(--glass-border-light)] flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-pink-500" />
                              {show.startTime}
                            </span>
                            <span className="text-xs font-bold glass-btn-primary px-3 py-1 rounded-xl shadow-sm">
                              Book Seats →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
