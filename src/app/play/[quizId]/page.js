'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import { getCustomQuiz, submitCustomQuizScore, getCustomQuizLeaderboard, onAuthStateChanged, getUserProfile } from '@/lib/firebase';
import Link from 'next/link';

const TIMER_SECONDS = 30;

export default function PlayCustomQuiz({ params }) {
  const { quizId } = use(params);
  
  const [quiz, setQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const data = await getUserProfile(currentUser.uid);
        if (data) setProfile(data);
      }
    });

    const loadData = async () => {
      const q = await getCustomQuiz(quizId);
      if (!q) {
        setError('Quiz tidak ditemukan atau sudah dihapus.');
      } else {
        setQuiz(q);
        const lb = await getCustomQuizLeaderboard(quizId);
        setLeaderboard(lb);
      }
      setLoading(false);
    };

    loadData();
    return () => unsubscribe();
  }, [quizId]);

  // Timer logic
  useEffect(() => {
    if (!isPlaying || quizFinished || isAnswered) return;

    if (timeLeft <= 0) {
      handleAnswerTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPlaying, quizFinished, isAnswered]);

  const handleAnswerTimeout = () => {
    setIsAnswered(true);
    setSelectedOpt(null);
    setStreak(0); // Break streak
  };

  const handleAnswer = (optIndex) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedOpt(optIndex);

    const isCorrect = optIndex === quiz.questions[currentIndex].answer;
    if (isCorrect) {
      const timeBonus = Math.floor((timeLeft / TIMER_SECONDS) * 50);
      const streakMultiplier = 1 + (streak * 0.1); // +10% per streak
      
      const earnedScore = Math.floor((100 + timeBonus) * streakMultiplier);
      
      setScore(prev => prev + earnedScore);
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0); // Break streak
    }
  };

  const handleNext = async () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOpt(null);
      setTimeLeft(TIMER_SECONDS);
    } else {
      setQuizFinished(true);
      setIsPlaying(false);
      
      // Submit score
      const finalScore = {
        score,
        correctCount,
        total: quiz.questions.length,
        playerName: profile?.name || user?.displayName || 'Anonymous',
        photoURL: user?.photoURL || null
      };
      
      await submitCustomQuizScore(quizId, finalScore, user?.uid || null);
      
      // Refresh LB
      const lb = await getCustomQuizLeaderboard(quizId);
      setLeaderboard(lb);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href.split('?')[0]; // remove query params
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '100px' }}><h1>❌ {error}</h1><Link href="/">Kembali ke Beranda</Link></div>;

  return (
    <>
      <Navbar />
      <main className="main-content">
        <div className="quiz-container">
          
          {/* LOBBY STATE */}
          {!isPlaying && !quizFinished && (
            <div className="text-center anim-scale" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
              <div style={{ fontSize: '5rem', marginBottom: '16px', display: 'inline-block', filter: 'drop-shadow(4px 4px 0px var(--navy))' }}>
                ⚔️
              </div>
              <h1 className="heading-lg anim-up" style={{ marginBottom: '12px', fontSize: '2.5rem' }}>
                {quiz.title}
              </h1>
              <p className="anim-up" style={{ color: 'var(--text-mid)', marginBottom: '32px', fontSize: '1.2rem', fontWeight: 600, animationDelay: '0.1s' }}>
                {quiz.questions.length} Pertanyaan • Dibuat oleh Cendekiawan lain
              </p>

              <button 
                className="btn btn-primary anim-up" 
                style={{ fontSize: '1.4rem', padding: '16px 48px', marginBottom: '24px', animationDelay: '0.2s', width: '100%' }}
                onClick={() => {
                  setIsPlaying(true);
                  setCurrentIndex(0);
                  setScore(0);
                  setStreak(0);
                  setCorrectCount(0);
                  setTimeLeft(TIMER_SECONDS);
                }}
              >
                Mulai Main Sekarang 🚀
              </button>
              
              <button 
                className="btn btn-secondary anim-up" 
                onClick={handleCopyLink}
                style={{ animationDelay: '0.3s', width: '100%', marginBottom: '40px' }}
              >
                {copied ? '✅ Link Tersalin!' : '🔗 Bagikan Tantangan Ini'}
              </button>

              <div className="card anim-up" style={{ padding: '24px', textAlign: 'left', animationDelay: '0.4s' }}>
                <h3 className="heading-sm" style={{ marginBottom: '16px', borderBottom: '2px dashed var(--navy)', paddingBottom: '12px' }}>🏆 Top Scores</h3>
                {leaderboard.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Belum ada yang memainkan quiz ini. Jadilah yang pertama!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {leaderboard.map((entry, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-light)', borderRadius: '8px', border: '2px solid var(--navy)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 900, fontSize: '1.2rem', color: idx < 3 ? 'var(--amber)' : 'var(--navy)' }}>#{idx + 1}</span>
                          {entry.photoURL ? (
                            <img src={entry.photoURL} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                              {entry.playerName[0].toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontWeight: 700 }}>{entry.playerName}</span>
                        </div>
                        <div style={{ fontWeight: 900, color: 'var(--navy)' }}>{entry.score} pts</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PLAYING STATE */}
          {isPlaying && (
            <div className="anim-fade-up">
              <div className="quiz-header">
                <div className="quiz-subject-tag">
                  <div className="quiz-subject-icon">🎯</div>
                  <div>
                    <div className="quiz-subject-name">{quiz.title}</div>
                    <div className="quiz-grade-tag">Custom Quiz</div>
                  </div>
                </div>

                <div className="quiz-progress-wrap">
                  <div className="progress-meta">
                    <span>Soal {currentIndex + 1} dari {quiz.questions.length}</span>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {streak >= 3 && <span style={{ color: 'var(--danger)', fontWeight: 800, animation: 'pulse 1s infinite' }}>🔥 {streak}x Streak!</span>}
                      <span style={{ color: 'var(--amber)' }}>Skor: {score}</span>
                    </div>
                  </div>
                  <div className="progress-bar-wrap">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className={`quiz-timer ${timeLeft <= 5 ? 'danger' : timeLeft <= 10 ? 'warning' : ''}`}>
                  {timeLeft}
                </div>
              </div>

              <div className="question-card">
                <div className="q-number">Soal Nomor {currentIndex + 1}</div>
                <h3 className="q-text">{quiz.questions[currentIndex].question}</h3>
              </div>

              <div className="options-list">
                {quiz.questions[currentIndex].options.map((opt, idx) => {
                  const isCorrectAnswer = idx === quiz.questions[currentIndex].answer;
                  const isSelected = selectedOpt === idx;
                  
                  let btnClass = 'option-btn';
                  let resultIcon = null;

                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      btnClass += ' correct';
                      resultIcon = '✅';
                    } else if (isSelected) {
                      btnClass += ' wrong';
                      resultIcon = '❌';
                    }
                  } else if (isSelected) {
                    btnClass += ' selected';
                  }

                  const letter = String.fromCharCode(65 + idx);

                  return (
                    <button
                      key={idx}
                      className={btnClass}
                      onClick={() => handleAnswer(idx)}
                      disabled={isAnswered}
                      id={`option-btn-${idx}`}
                    >
                      <span className="option-key">{letter}</span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {resultIcon && <span className="option-result-icon">{resultIcon}</span>}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="anim-scale" style={{ marginTop: '24px', textAlign: 'right' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleNext}
                  >
                    {currentIndex === quiz.questions.length - 1 ? 'Selesai & Lihat Hasil 🏁' : 'Soal Selanjutnya ➔'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* RESULT STATE */}
          {quizFinished && (
            <div className="result-wrap anim-scale">
              <h2 className="heading-lg" style={{ marginBottom: '8px' }}>Permainan Selesai!</h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-mid)', fontWeight: 600, marginBottom: '32px' }}>
                Kamu menyelesaikan tantangan "{quiz.title}"
              </p>

              <div className="result-score-badge">
                Skor Akhir: {score}
              </div>

              <div className="result-stats-row" style={{ marginBottom: '32px' }}>
                <div className="stat-box">
                  <div className="stat-value" style={{ color: 'var(--success)' }}>{correctCount}</div>
                  <div className="stat-label">Benar</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value" style={{ color: 'var(--danger)' }}>{quiz.questions.length - correctCount}</div>
                  <div className="stat-label">Salah</div>
                </div>
              </div>
              
              {!user && (
                <div className="card-soft anim-up" style={{ padding: '16px', background: 'var(--amber)', color: 'var(--navy)', marginBottom: '32px' }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>⚠️ Kamu bermain sebagai Anonymous. Login di Beranda agar skormu masuk ke Top Scores dan mendapat XP!</p>
                </div>
              )}

              <div className="card anim-up" style={{ padding: '24px', textAlign: 'left', marginBottom: '32px' }}>
                <h3 className="heading-sm" style={{ marginBottom: '16px', borderBottom: '2px dashed var(--navy)', paddingBottom: '12px' }}>🏆 Top Scores</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {leaderboard.map((entry, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-light)', borderRadius: '8px', border: '2px solid var(--navy)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.2rem', color: idx < 3 ? 'var(--amber)' : 'var(--navy)' }}>#{idx + 1}</span>
                        {entry.photoURL ? (
                          <img src={entry.photoURL} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {entry.playerName[0].toUpperCase()}
                          </div>
                        )}
                        <span style={{ fontWeight: 700 }}>{entry.playerName}</span>
                      </div>
                      <div style={{ fontWeight: 900, color: 'var(--navy)' }}>{entry.score} pts</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link href="/" className="btn btn-secondary">
                  Kembali ke Beranda
                </Link>
                <button className="btn btn-primary" onClick={handleCopyLink}>
                  {copied ? '✅ Link Tersalin!' : '🔗 Bagikan Tantangan Ini'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
