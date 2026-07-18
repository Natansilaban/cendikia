'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged, getUserProfile } from '@/lib/firebase';

const NAV_LINKS = [
  { href: '/', label: 'Beranda', icon: '🏠' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/create', label: 'Buat Quiz', icon: '✍️' },
  { href: '/profile', label: 'Profil', icon: '👤' },
];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Legacy local profile check
    const saved = localStorage.getItem('ca_ext_profile');
    if (saved) setProfile(JSON.parse(saved));

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);

    const unsubscribe = onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const data = await getUserProfile(currentUser.uid);
        if (data) setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      unsubscribe();
    };
  }, []);

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" className="navbar-logo">
            <span>Cendi<span style={{ color: 'var(--amber)' }}>kia</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-nav" role="navigation" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="navbar-actions">
            
            {profile && profile.xp !== undefined && (
              <div style={{ display: 'none', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--amber)', color: 'var(--navy)', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: '0.9rem' }} className="xp-badge-desktop">
                ⭐ {profile.xp} XP
              </div>
            )}

            <Link href="/profile" id="nav-avatar" style={{ textDecoration: 'none' }}>
              {user && user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Avatar" 
                  title={profile?.name || user.displayName}
                  style={{ width: '40px', height: '40px', borderRadius: 'var(--r-md)', border: '2px solid var(--navy)' }}
                />
              ) : (
                <div className="profile-avatar-nav" title="Setup Profil">
                  {profile?.name ? getInitials(profile.name) : '?'}
                </div>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{
                display: 'none',
                padding: '8px',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-section)',
                border: '2px solid var(--navy)',
                color: 'var(--navy)',
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          borderBottom: '2px solid var(--navy)',
          padding: '12px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 999,
          boxShadow: '0 6px 0 var(--navy)',
        }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              style={{ padding: '12px 16px' }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          {profile && profile.xp !== undefined && (
            <div style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--amber)' }}>
              ⭐ {profile.xp} XP
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @media (min-width: 769px) {
          .xp-badge-desktop { display: flex !important; }
        }
        @media (max-width: 768px) {
          #mobile-menu-toggle { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </>
  );
}
