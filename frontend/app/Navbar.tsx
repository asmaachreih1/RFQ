'use client';

import Link from 'next/link';
import { useApp } from './Providers';
import { api } from '@/lib/api';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, notifications, clearNotifications } = useApp();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Notifications
      if (
        notifOpen &&
        notifRef.current &&
        !notifRef.current.contains(event.target as Node) &&
        !notifBtnRef.current?.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
      // User Menu
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuBtnRef.current?.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen, menuOpen]);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setMenuOpen(false);
    router.push('/auth/login');
  };

  const navLinks = user ? (
    user.role === 'user' ? [
      { name: 'Dashboard', href: '/user/dashboard' },
      { name: 'My Requests', href: '/user/dashboard#my-requests' },
    ] : [
      { name: 'Dashboard', href: '/company/dashboard' },
      { name: 'Available Requests', href: '/company/dashboard#available-requests' },
      { name: 'My Quotations', href: '/company/quotations' },
    ]
  ) : [];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header
      className={`fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 transition-all duration-300 rounded-2xl border ${scrolled
        ? 'bg-white/80 dark:bg-card/80 backdrop-blur-xl shadow-lg py-2 border-primary/10'
        : 'bg-white/60 dark:bg-card/60 backdrop-blur-md shadow-sm py-3 border-white/20 dark:border-white/10'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setMenuOpen(false)}
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            RFQ Market
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium transition-colors relative group ${pathname === link.href.split('#')[0]
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-primary'
                }`}
            >
              {link.name}
              <span className="absolute left-4 right-4 bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
            </Link>
          ))}
          {!user && !pathname?.startsWith('/auth') && (
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              For Suppliers
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

          {user && (
            <div className="relative">
              <button
                ref={notifBtnRef}
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Notifications"
              >
                <svg className={`w-6 h-6 ${unreadCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-card animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div
                  ref={notifRef}
                  className="absolute right-0 mt-4 w-80 bg-popover rounded-2xl shadow-xl border border-border/50 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right"
                >
                  <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications} className="text-xs text-primary hover:underline">Clear all</button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-4 border-b border-border/50 text-sm hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                          <p className="font-medium mb-1">{n.message}</p>
                          <p className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleTimeString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">Login</Link>
              <Link href="/auth/register" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all">
                Get Started
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                ref={menuBtnRef}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent hover:ring-primary/20"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-4 w-56 rounded-2xl bg-popover text-popover-foreground border border-border/50 shadow-xl z-20 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="px-4 py-3 border-b border-border/50 bg-muted/30 mb-2">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide">
                      {user.role}
                    </span>
                  </div>

                  {/* Mobile Links (visible in menu on mobile only ideally, but here redundant for desktop if hidden there) */}
                  <div className="md:hidden border-b border-border/50 mb-2 pb-2">
                    {navLinks.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
