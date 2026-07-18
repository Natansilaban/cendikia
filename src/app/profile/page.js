'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getQuizHistory, signInWithGoogle, logOut, onAuthStateChanged, getUserProfile, getFirebaseAuth } from '@/lib/firebase';
import { SUBJECTS } from '@/data/subjects';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  
  const [formData, setFormData] = useState({
    grade: 'X',
    gradeDetail: '',
    school: '',
    major: '',
  });
  
  const [history, setHistory] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Local fallback history
    setHistory(getQuizHistory());

    const unsubscribe = onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const data = await getUserProfile(currentUser.uid);
        setProfileData(data);
        
        // Load additional local profile info if it exists
        const saved = localStorage.getItem(`ca_ext_profile_${currentUser.uid}`);
        if (saved) {
          setFormData(JSON.parse(saved));
        }
      } else {
        setProfileData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!user) return;

    localStorage.setItem(`ca_ext_profile_${user.uid}`, JSON.stringify(formData));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      alert("Gagal login: " + e.message);
    }
  };

  const handleLogout = async () => {
    await logOut();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const p = name.trim().split(' ');
    return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  const totalQuizzes = history.length;
  
  // Calculate completion
  const uniqueSubjects = new Set(history.map(h => h.subjectId)).size;
  const completionPct = Math.round((uniqueSubjects / SUBJECTS.length) * 100);

  return (
    <>
      <Navbar />
      <main className="main-content">
        <div className="profile-container anim-fade-up">
          
          <div className="text-center" style={{ textAlign: 'center', marginBottom: '32px' }}>
            {user ? (
              <>
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--navy)', marginBottom: '16px' }}
                />
                <h1 className="heading-md">{user.displayName}</h1>
                
                {profileData && (
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', marginBottom: '24px' }}>
                    <div className="card-soft" style={{ padding: '8px 16px', backgroundColor: 'var(--navy)', color: 'white', fontWeight: 800 }}>
                      ⭐ XP: {profileData.xp}
                    </div>
                    <div className="card-soft" style={{ padding: '8px 16px', backgroundColor: 'var(--amber)', color: 'var(--navy)', fontWeight: 800 }}>
                      🏆 Rank: {profileData.rank}
                    </div>
                  </div>
                )}
                
                <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <div className="profile-avatar-lg">?</div>
                <h1 className="heading-md">Profil Pelajar</h1>
                <p style={{ color: 'var(--text-mid)', fontWeight: 600, marginBottom: '24px' }}>Login dengan Google untuk menyimpan XP dan progres belajarmu secara permanen!</p>
                <button className="btn btn-primary" onClick={handleLogin}>Login dengan Google</button>
              </>
            )}
          </div>

          {user && (
            <div className="card anim-up" style={{ padding: '32px', marginBottom: '40px', animationDelay: '0.1s' }}>
              <h2 className="heading-sm" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✏️</span> Lengkapi Profil Sekolah
              </h2>
              
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kelas *</label>
                    <select
                      name="grade"
                      className="form-select"
                      value={formData.grade}
                      onChange={handleChange}
                    >
                      <option value="X">Kelas 10 (X)</option>
                      <option value="XI">Kelas 11 (XI)</option>
                      <option value="XII">Kelas 12 (XII)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Detail Kelas</label>
                    <input
                      type="text"
                      name="gradeDetail"
                      className="form-input"
                      placeholder="Contoh: MIPA 1, IPS 2"
                      value={formData.gradeDetail}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Sekolah *</label>
                  <input
                    type="text"
                    name="school"
                    className="form-input"
                    placeholder="Contoh: SMAN 1 Bandung"
                    value={formData.school}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jurusan / Keahlian</label>
                  <select
                    name="major"
                    className="form-select"
                    value={formData.major}
                    onChange={handleChange}
                  >
                    <option value="">Pilih Jurusan (Opsional)</option>
                    <option value="IPA/MIPA">IPA / MIPA</option>
                    <option value="IPS">IPS</option>
                    <option value="Bahasa">Bahasa</option>
                    <option value="TKJ">Teknik Komputer & Jaringan (SMK)</option>
                    <option value="RPL">Rekayasa Perangkat Lunak (SMK)</option>
                    <option value="AKL">Akuntansi (SMK)</option>
                    <option value="OTKP">Perkantoran (SMK)</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                  Simpan Profil
                </button>
              </form>
            </div>
          )}

          {/* Stats Box */}
          <div className="card anim-up" style={{ padding: '32px', marginBottom: '40px', animationDelay: '0.2s' }}>
            <h2 className="heading-sm" style={{ marginBottom: '24px' }}>📊 Statistik Belajar (Lokal)</h2>
            
            <div className="stats-row" style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
              <div className="stat-box" style={{ flex: 1, textAlign: 'center', padding: '24px', backgroundColor: 'var(--bg-light)', borderRadius: '16px', border: '2px solid var(--navy)', boxShadow: '4px 4px 0px var(--navy)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--navy)' }}>{totalQuizzes}</div>
                <div style={{ color: 'var(--text-mid)', fontWeight: 700 }}>Quiz Selesai</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontWeight: 700 }}>
                <span>Penyelesaian Mata Pelajaran</span>
                <span style={{ color: 'var(--amber)' }}>{uniqueSubjects} dari {SUBJECTS.length} Mapel ({completionPct}%)</span>
              </div>
              <div className="completion-bar-bg">
                <div className="completion-bar-fill" style={{ width: `${completionPct}%` }}></div>
              </div>
            </div>

          </div>

          {showToast && (
            <div className="toast anim-up">
              ✅ Profil berhasil disimpan!
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .profile-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        
        .profile-avatar-lg {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--navy);
          color: var(--bg-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0 auto 24px;
          box-shadow: 6px 6px 0px var(--amber);
        }

        .toast {
          position: fixed;
          bottom: 32px;
          right: 32px;
          background: var(--navy);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          font-weight: 700;
          box-shadow: 4px 4px 0px var(--amber);
          z-index: 1000;
        }
      `}</style>
    </>
  );
}
