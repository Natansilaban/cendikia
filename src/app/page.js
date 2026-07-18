'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { SUBJECTS } from '@/data/subjects';

const STATS = [
  { number: '330+', label: 'Soal Berkualitas' },
  { number: '11', label: 'Mata Pelajaran' },
  { number: '3', label: 'Tingkat Kelas' },
  { number: '∞', label: 'Latihan Bebas' },
];

function SubjectCard({ subject }) {
  const router = useRouter();

  return (
    <div
      id={`subject-card-${subject.id}`}
      className="subject-card"
      onClick={() => router.push(`/quiz/${subject.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/quiz/${subject.id}`)}
      style={{ '--subject-color': subject.color, '--subject-bg': `${subject.color}15` }}
    >
      <div className="subject-icon-wrap">
        {subject.icon}
      </div>
      <div className="subject-name">{subject.name}</div>
      <div className="subject-desc">{subject.description}</div>

      <div className="subject-footer">
        <span className="subject-count">
          <span>📝</span> 30 soal
        </span>
        <div className="subject-cta">
          Uji Coba →
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('ca_profile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  return (
    <>
      <Navbar />
      <main className="main-content">
        {/* ── HERO SECTION ─────────────────────────────────────────── */}
        <section className="hero container" aria-labelledby="hero-title">
          <div style={{ maxWidth: '640px', position: 'relative', zIndex: 10 }}>
            <div className="hero-tag anim-fade-down" aria-label="Platform baru">
              <span>📚</span> Kurikulum Merdeka
            </div>

            <h1 className="hero-title anim-up" id="hero-title">
              Belajar Makin Seru, <br />
              <span className="highlight">Prestasi Melaju!</span>
            </h1>

            <p className="hero-sub anim-up" style={{ animationDelay: '0.1s' }}>
              Platform latihan soal interaktif untuk siswa SMA/SMK. Uji pengetahuanmu, kumpulkan skor, dan jadilah yang terbaik di leaderboard nasional!
            </p>

            <div className="hero-actions anim-up" style={{ animationDelay: '0.2s' }}>
              {profile ? (
                <button
                  id="hero-start-quiz"
                  className="btn btn-amber"
                  onClick={() => {
                    const firstSubject = document.getElementById('subject-card-matematika');
                    firstSubject?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{ fontSize: '1.05rem', padding: '16px 36px' }}
                >
                  Mulai Belajar ✏️
                </button>
              ) : (
                <Link href="/profile" id="hero-setup-profile">
                  <button className="btn btn-amber" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>
                    Buat Profil & Mulai 🚀
                  </button>
                </Link>
              )}
              <Link href="/leaderboard" id="hero-view-leaderboard">
                <button className="btn btn-outline" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>
                  Lihat Papan Peringkat 🏆
                </button>
              </Link>
            </div>
          </div>

          {/* Educational Visuals on the Right */}
          <div className="hero-visual">
            <div className="hero-deco anim-scale">
              <div className="deco-circle" style={{ width: '100%', height: '100%', background: 'var(--amber-light)', borderRadius: '50%' }}></div>
              <div className="deco-pencil" style={{ position: 'absolute', top: '20%', left: '10%', fontSize: '5rem', filter: 'drop-shadow(4px 4px 0px var(--navy))' }}>✏️</div>
              <div className="deco-pencil" style={{ position: 'absolute', bottom: '15%', right: '15%', fontSize: '4.5rem', animationDelay: '1s', filter: 'drop-shadow(4px 4px 0px var(--amber))' }}>📐</div>
              <div className="deco-pencil" style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '3.5rem', animationDelay: '0.5s', filter: 'drop-shadow(2px 2px 0px var(--emerald))' }}>💡</div>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ────────────────────────────────────────────── */}
        <div className="stats-strip anim-up" style={{ animationDelay: '0.3s' }}>
          <div className="container">
            <div className="stats-strip-inner" role="list" aria-label="Statistik platform">
              {STATS.map((stat, i) => (
                <div key={i} className="stat-block" role="listitem">
                  <div className="stat-num">{stat.number}</div>
                  <div className="stat-lbl">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SUBJECTS GRID ─────────────────────────────────────────── */}
        <section className="container" aria-labelledby="subjects-title" style={{ padding: '80px 24px' }}>
          <div className="section-head text-center" style={{ textAlign: 'center' }}>
            <span className="section-eyebrow">Pilih Mapelmu</span>
            <h2 className="section-title" id="subjects-title">
              Mata Pelajaran <span className="text-underline">Tersedia</span>
            </h2>
          </div>

          <div className="subject-grid">
            {SUBJECTS.map((subject, i) => (
              <div
                key={subject.id}
                className="anim-up"
                style={{ animationDelay: `${(i % 4) * 0.1}s` }}
              >
                <SubjectCard subject={subject} />
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ────────────────────────────────────────────── */}
        {!profile && (
          <section className="container" style={{ paddingBottom: '100px' }}>
            <div className="card-amber" style={{ padding: '50px 30px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', left: '-20px', fontSize: '8rem', opacity: 0.1 }}>🎓</div>
              <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.1 }}>🏆</div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '16px', color: 'var(--navy)' }}>
                  Siap Menguji Kemampuanmu?
                </h2>
                <p style={{ color: 'var(--text-mid)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px', fontSize: '1.1rem', fontWeight: 600 }}>
                  Isi profilmu sekarang dan pastikan namamu tercatat di papan peringkat nasional!
                </p>
                <Link href="/profile" id="cta-setup-profile">
                  <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
                    Daftar Sekarang 📝
                  </button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
