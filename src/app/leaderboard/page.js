'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getLeaderboard } from '@/lib/firebase';

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [source, setSource] = useState('local');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await getLeaderboard();
    if (res) {
      setData(res.data);
      setSource(res.source);
    }
    setLoading(false);
  };

  const top3 = data.slice(0, 3);
  const rest = data.slice(3, 100);

  // Helper for podium rendering
  const getPodiumOrder = () => {
    if (top3.length === 0) return [];
    if (top3.length === 1) return [{ ...top3[0], pos: 'center', rank: 1 }];
    if (top3.length === 2) return [
      { ...top3[1], pos: 'left', rank: 2 },
      { ...top3[0], pos: 'center', rank: 1 }
    ];
    return [
      { ...top3[1], pos: 'left', rank: 2 },
      { ...top3[0], pos: 'center', rank: 1 },
      { ...top3[2], pos: 'right', rank: 3 }
    ];
  };

  const podiumOrder = getPodiumOrder();

  return (
    <>
      <Navbar />
      <main className="main-content">
        <div className="lb-container">
          
          <div className="text-center anim-fade-up" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--bg-light)', borderRadius: '20px', border: '2px solid var(--navy)', fontWeight: 700, marginBottom: '16px', fontSize: '0.9rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: source === 'firebase' ? 'var(--success)' : 'var(--text-muted)' }}></div>
              {source === 'firebase' ? 'Global Server Online' : 'Mode Lokal (Offline)'}
            </div>
            
            <h1 className="heading-xl" style={{ marginBottom: '8px' }}>Papan Peringkat <span style={{ color: 'var(--amber)' }}>Nasional</span></h1>
            <p style={{ color: 'var(--text-mid)', fontSize: '1.2rem', fontWeight: 600 }}>Bersaing kumpulkan XP dengan siswa-siswi terbaik se-Indonesia</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
            <button className="btn btn-secondary anim-up" onClick={fetchData} style={{ animationDelay: '0.2s' }}>
              Refresh 🔄
            </button>
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: '60px' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '16px', fontWeight: 600 }}>Memuat data leaderboard...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="card text-center anim-up" style={{ padding: '60px 24px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📭</div>
              <h2 className="heading-sm">Belum ada data</h2>
              <p>Jadilah yang pertama untuk mendapatkan XP!</p>
            </div>
          ) : (
            <>
              {/* Podium View */}
              <div className="podium-wrap anim-up" style={{ animationDelay: '0.3s' }}>
                {podiumOrder.map((user) => (
                  <div key={user.uid} className={`podium-slot ${user.pos}`}>
                    <span className="podium-medal">
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                    </span>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="avatar" className="podium-avatar" />
                    ) : (
                      <div className="podium-avatar">
                        {user.name ? user.name[0].toUpperCase() : '?'}
                      </div>
                    )}
                    <div className="podium-name">{user.name}</div>
                    <div className="podium-score" style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{user.xp}</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block' }}>XP</span>
                    </div>
                    <div className="podium-rank-badge" style={{ marginTop: '8px', fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                      {user.rank || 'Pemula'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table View */}
              {rest.length > 0 && (
                <div className="card anim-up" style={{ marginTop: '32px', animationDelay: '0.4s' }}>
                  <div className="lb-table-wrap">
                    <table className="lb-table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
                          <th>Pelajar</th>
                          <th>Pangkat</th>
                          <th style={{ textAlign: 'right' }}>Total XP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rest.map((user, idx) => {
                          const rank = idx + 4;
                          
                          return (
                            <tr key={user.uid} className="lb-table-row">
                              <td className="lb-rank-num">#{rank}</td>
                              <td>
                                <div className="lb-user-cell">
                                  {user.photoURL ? (
                                    <img src={user.photoURL} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                  ) : (
                                    <div className="lb-avatar-small">
                                      {user.name ? user.name[0].toUpperCase() : '?'}
                                    </div>
                                  )}
                                  <div>
                                    <div className="lb-name">{user.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="quiz-grade-tag" style={{ display: 'inline-block', fontSize: '0.8rem', padding: '4px 8px' }}>
                                  {user.rank || 'Pemula'}
                                </div>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--amber)' }}>
                                {user.xp} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>XP</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {source === 'local' && (
            <div className="card-soft anim-up" style={{ marginTop: '40px', padding: '16px 24px', background: 'var(--amber)', color: 'var(--navy)', animationDelay: '0.5s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>💡</span>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>Mode Lokal Aktif</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Kamu sedang melihat leaderboard lokal. Login dengan Google untuk masuk ke leaderboard global!</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <style jsx>{`
        .lb-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .podium-wrap {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 16px;
          min-height: 350px;
          margin-bottom: 24px;
        }
        
        @media (max-width: 600px) {
          .podium-wrap { gap: 8px; }
          .lb-table { font-size: 0.9rem; }
        }
      `}</style>
    </>
  );
}
