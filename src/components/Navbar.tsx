import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { Bell, Film, User as UserIcon, Shield, LogOut, Check } from 'lucide-react';

interface NavbarProps {
  activeTab: 'movies' | 'theatres' | 'bookings' | 'admin';
  setActiveTab: (tab: 'movies' | 'theatres' | 'bookings' | 'admin') => void;
  onOpenAuth: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }: NavbarProps) {
  const { user, isAuthenticated, isAdmin, logout, quickLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark with Purple-Pink-Yellow Glass Emblem */}
        <button
          onClick={() => setActiveTab('movies')}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 p-[1.5px] shadow-[0_0_20px_rgba(236,72,153,0.35)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all">
            <div className="w-full h-full rounded-[14px] bg-white/90 backdrop-blur-md flex items-center justify-center">
              <Film className="w-5 h-5 text-pink-600 transition-colors" />
            </div>
          </div>
          <div>
            <span className="text-xl font-display font-black tracking-wider uppercase text-gradient-tri block leading-none">
              IMOVIES
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)] block mt-1">
              Cinema Engine
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Glass Capsule Container) */}
        <nav className="hidden md:flex items-center p-1.5 glass-panel-subtle rounded-2xl border border-[var(--glass-border-light)] gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'movies'
                ? 'glass-btn-primary shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Movies & Shows
          </button>
          <button
            onClick={() => setActiveTab('theatres')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'theatres'
                ? 'glass-btn-primary shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Theatres & Screens
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'glass-btn-primary shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            My Bookings
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'glass-pill-purple font-bold shadow-sm'
                  : 'text-purple-600 hover:bg-purple-500/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Notifications & User Session */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isAuthenticated ? (
            <>
              {/* Notification Popover */}
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2.5 rounded-2xl glass-btn-secondary text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl glass-panel-elevated shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 border border-[var(--glass-border-highlight)]">
                    <div className="px-4 py-3 border-b border-[var(--glass-border-light)] flex items-center justify-between bg-white/[0.04]">
                      <span className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase font-mono">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-pink-600 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-[var(--glass-border-light)]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-3.5 hover:bg-purple-500/10 transition-colors cursor-pointer ${
                              !n.read ? 'bg-pink-500/8' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-[var(--text-primary)]">{n.title}</span>
                              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl glass-panel-subtle hover:border-[var(--glass-border-highlight)] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 flex items-center justify-center text-white font-black text-xs uppercase shadow-sm">
                    {user?.name.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-bold text-[var(--text-primary)] truncate max-w-[130px]">{user?.name}</p>
                    <p className="text-[10px] text-pink-600 font-mono capitalize">{user?.role}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 rounded-3xl glass-panel-elevated shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 border border-[var(--glass-border-highlight)]">
                    <div className="px-4 py-3 border-b border-[var(--glass-border-light)] bg-white/[0.04]">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user?.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email}</p>
                    </div>

                    {/* Quick Demo Switcher */}
                    <div className="p-2 border-b border-[var(--glass-border-light)]">
                      <p className="px-2 pb-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider font-mono">
                        Switch Demo Role
                      </p>
                      <button
                        onClick={() => {
                          quickLogin('admin');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          isAdmin ? 'glass-pill-purple font-bold' : 'text-[var(--text-secondary)] hover:bg-purple-500/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-purple-600" />
                          <span>Admin (Manager)</span>
                        </div>
                        {isAdmin && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      </button>
                      <button
                        onClick={() => {
                          quickLogin('user');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors mt-1 cursor-pointer ${
                          !isAdmin ? 'glass-pill-pink font-bold' : 'text-[var(--text-secondary)] hover:bg-pink-500/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-3.5 h-3.5 text-pink-600" />
                          <span>Customer (Viewer)</span>
                        </div>
                        {!isAdmin && <Check className="w-3.5 h-3.5 text-pink-600" />}
                      </button>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/15 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="glass-btn-primary px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div className="md:hidden flex items-center justify-around border-t border-[var(--glass-border-light)] py-2.5 px-4 text-xs font-semibold text-[var(--text-secondary)] glass-panel">
        <button
          onClick={() => setActiveTab('movies')}
          className={`py-1 px-3 rounded-lg ${activeTab === 'movies' ? 'glass-pill-purple font-bold' : ''}`}
        >
          Movies
        </button>
        <button
          onClick={() => setActiveTab('theatres')}
          className={`py-1 px-3 rounded-lg ${activeTab === 'theatres' ? 'glass-pill-pink font-bold' : ''}`}
        >
          Theatres
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-1 px-3 rounded-lg ${activeTab === 'bookings' ? 'glass-pill-yellow font-bold' : ''}`}
        >
          Bookings
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-1 px-3 rounded-lg ${activeTab === 'admin' ? 'glass-pill-purple font-bold' : ''}`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
}
