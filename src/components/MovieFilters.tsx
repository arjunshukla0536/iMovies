import { Search, X } from 'lucide-react';

interface MovieFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: 'now-showing' | 'upcoming' | 'all';
  onStatusChange: (status: 'now-showing' | 'upcoming' | 'all') => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  selectedFormat: string;
  onFormatChange: (format: string) => void;
}

const GENRES = ['All', 'Action', 'Sci-Fi', 'Fantasy', 'Mystery', 'Adventure', 'Thriller', 'Horror'];
const FORMATS = ['All', 'IMAX 3D', '4DX', '3D', '2D'];

export default function MovieFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedGenre,
  onGenreChange,
  selectedFormat,
  onFormatChange,
}: MovieFiltersProps) {
  return (
    <div className="space-y-5 mb-8">
      {/* Top row: Status Segmented Control & Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Segmented Tabs in Frosted Glass Capsule */}
        <div className="flex items-center p-1.5 glass-panel rounded-2xl border border-[var(--glass-border-light)] self-start shadow-md gap-1">
          <button
            onClick={() => onStatusChange('now-showing')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              selectedStatus === 'now-showing'
                ? 'glass-btn-primary font-bold shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => onStatusChange('upcoming')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              selectedStatus === 'upcoming'
                ? 'glass-btn-primary font-bold shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Upcoming Premieres
          </button>
          <button
            onClick={() => onStatusChange('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'glass-btn-primary font-bold shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            All Movies
          </button>
        </div>

        {/* Glass Search Bar */}
        <div className="relative min-w-[300px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500/70 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search by title, director, cast..."
            className="w-full pl-10 pr-9 py-2.5 glass-input rounded-2xl text-xs placeholder-[var(--glass-input-placeholder)] focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Second row: Genre & Format Glass Filter Chips in Purple & Pink */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl glass-panel-subtle border border-[var(--glass-border-light)]">
        {/* Genre filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[var(--text-secondary)] font-bold mr-1.5 font-display">Genre:</span>
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className={`px-3 py-1.5 text-xs rounded-xl transition-all cursor-pointer ${
                selectedGenre === genre
                  ? 'glass-pill-purple font-bold shadow-sm'
                  : 'glass-pill hover:border-[var(--glass-border-highlight)]'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Format filter buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--text-secondary)] font-bold mr-1.5 font-display">Format:</span>
          {FORMATS.map(fmt => (
            <button
              key={fmt}
              onClick={() => onFormatChange(fmt)}
              className={`px-3 py-1.5 text-xs rounded-xl transition-all cursor-pointer ${
                selectedFormat === fmt
                  ? 'glass-pill-pink font-bold shadow-sm'
                  : 'glass-pill hover:border-[var(--glass-border-highlight)]'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
