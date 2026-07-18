'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { SUBJECTS } from '@/data/subjects';
import { getQuestions } from '@/data/questions';
import { submitScore } from '@/lib/firebase';

const GRADES = [
  { id: 'X', label: 'Kelas 10' },
  { id: 'XI', label: 'Kelas 11' },
  { id: 'XII', label: 'Kelas 12' },
];

const QUESTION_COUNT = 10;
const TIMER_SECONDS = 30;

// ── Grade Selection Screen ────────────────────────────────────
function GradeSelector({ subject, onSelect }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '700px', margin: '0 auto' }}>
      <div className="anim-scale" style={{ fontSize: '5rem', marginBottom: '16px', display: 'inline-block', filter: 'drop-shadow(4px 4px 0px var(--navy))' }}>
        {subject.icon}
      </div>
      <h1 className="heading-lg anim-up" style={{ marginBottom: '12px' }}>
        Quiz <span className="text-underline">{subject.name}</span>
      </h1>
      <p className="anim-up" style={{ color: 'var(--text-mid)', marginBottom: '48px', fontSize: '1.1rem', fontWeight: 600, animationDelay: '0.1s' }}>
        Pilih tingkat kelas untuk memulai ujian
      </p>

      <div className="grade-grid anim-up" style={{ animationDelay: '0.2s' }}>
        {GRADES.map((grade) => (
          <button
            key={grade.id}
            id={`grade-btn-${grade.id}`}
            className="grade-btn"
            onClick={() => onSelect(grade.id)}
          >
            <div className="grade-num" style={{ color: subject.color }}>{grade.id}</div>
            <div className="grade-lbl">{grade.label}</div>
          </button>
        ))}
      </div>

      <div className="card-soft anim-up" style={{ maxWidth: '480px', margin: '0 auto', padding: '24px', display: 'flex', gap: '24px', justifyContent: 'center', animationDelay: '0.3s' }}>
        {[
          { icon: '📝', label: `${QUESTION_COUNT} soal` },
          { icon: '⏱️', label: `${TIMER_SECONDS}s/soal` },
          { icon: '🏆', label: 'Masuk Leaderboard' },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{item.icon}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── Result Screen ─────────────────────────────────────────────
function ResultScreen({ score, total, correct, subject, grade, onRetry, onLeaderboard }) {
  const percentage = Math.round((correct / total) * 100);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    import('@/lib/firebase').then(({ onAuthStateChanged, getUserProfile }) => {
      const p = localStorage.getItem('ca_ext_profile');
      if (p) {
        try { setProfile(JSON.parse(p)); } catch(e) {}
      }

      onAuthStateChanged(async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const data = await getUserProfile(currentUser.uid);
          if (data) {
            const ext = localStorage.getItem(`ca_ext_profile_${currentUser.uid}`);
            if (ext) {
              setProfile({ ...data, ...JSON.parse(ext) });
            } else {
              setProfile(data);
            }
          }
        }
      });
    });
  }, []);

  const handleSaveScore = async () => {
    if (!profile && !user) return;
    setSaving(true);
    
    const { submitScore } = await import('@/lib/firebase');
    const scoreData = {
      subjectId: subject.id,
      grade: grade,
      score: score,
      correct: correct,
      total: total,
      name: profile?.name || user?.displayName || 'Anonim',
      school: profile?.school || '',
    };
    
    const success = await submitScore(scoreData, user ? user.uid : null);
    setSaving(false);
    if (success && success.success) setSaved(true);
  };

  let message = '';
  if (percentage >= 90) message = 'Luar Biasa! 🌟';
  else if (percentage >= 70) message = 'Kerja Bagus! 👍';
  else if (percentage >= 50) message = 'Lumayan, tingkatkan lagi! 📚';
  else message = 'Jangan menyerah, ayo belajar lagi! 💪';

  return (
    <div className="result-wrap anim-scale">
      <h2 className="heading-md" style={{ marginBottom: '8px', color: 'var(--text-mid)' }}>Hasil Ujian {subject.name} - Kelas {grade}</h2>
      <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--amber)', marginBottom: '32px' }}>{message}</p>

      <div className="result-score-badge">
        <div className="result-pct">{percentage}%</div>
        <div className="result-pct-lbl">Akurasi</div>
      </div>

      <div className="result-stats-row">
        <div className="result-stat-box">
          <div className="result-stat-val" style={{ color: 'var(--navy)' }}>{score}</div>
          <div className="result-stat-lbl">Skor Akhir</div>
        </div>
        <div className="result-stat-box">
          <div className="result-stat-val" style={{ color: 'var(--success)' }}>{correct}</div>
          <div className="result-stat-lbl">Benar</div>
        </div>
        <div className="result-stat-box">
          <div className="result-stat-val" style={{ color: 'var(--danger)' }}>{total - correct}</div>
          <div className="result-stat-lbl">Salah</div>
        </div>
      </div>

      {profile || user ? (
        <div className="submit-box anim-up" style={{ animationDelay: '0.2s' }}>
          <p style={{ marginBottom: '16px', fontWeight: 700, fontSize: '0.95rem' }}>
            Halo, <span className="text-accent">{profile?.name || user?.displayName}</span>!
          </p>
          <button
            id="btn-save-score"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '12px' }}
            onClick={handleSaveScore}
            disabled={saving || saved}
          >
            {saving ? 'Menyimpan...' : saved ? '✅ Skor Tersimpan!' : 'Simpan ke Leaderboard 🏆'}
          </button>
          {!saved && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>*Skormu akan ditambahkan ke papan peringkat nasional</p>}
        </div>
      ) : (
        <div className="submit-box anim-up" style={{ animationDelay: '0.2s', borderColor: 'var(--amber)' }}>
          <p style={{ marginBottom: '16px', fontWeight: 700, color: 'var(--amber)' }}>⚠️ Profil belum diatur!</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', marginBottom: '16px' }}>Atur profilmu dulu agar skor bisa masuk ke leaderboard.</p>
          <button
            className="btn btn-amber"
            style={{ width: '100%' }}
            onClick={() => window.location.href = '/profile'}
          >
            Buat Profil Sekarang 👤
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onRetry}>
          Coba Lagi 🔄
        </button>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onLeaderboard}>
          Leaderboard 📊
        </button>
      </div>
    </div>
  );
}


// ── Quiz Engine ───────────────────────────────────────────────
export default function QuizPage({ params }) {
  const unwrappedParams = use(params);
  const subjectId = unwrappedParams.subject;

  const router = useRouter();
  const subject = SUBJECTS.find(s => s.id === subjectId);

  // States
  const [grade, setGrade] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [quizFinished, setQuizFinished] = useState(false);

  // Initialize
  useEffect(() => {
    if (!subject) router.push('/');
  }, [subject, router]);

  // Start quiz when grade selected
  const handleStart = (selectedGrade) => {
    const qList = getQuestions(subjectId, selectedGrade, QUESTION_COUNT);
    setQuestions(qList);
    setGrade(selectedGrade);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setQuizFinished(false);
    setTimeLeft(TIMER_SECONDS);
    setIsAnswered(false);
    setSelectedOpt(null);
  };

  // Timer logic
  useEffect(() => {
    if (!grade || quizFinished || isAnswered) return;

    if (timeLeft <= 0) {
      handleAnswerTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, grade, quizFinished, isAnswered]);

  const handleAnswerTimeout = () => {
    setIsAnswered(true);
    setSelectedOpt(null); // Indicates timeout
  };

  const handleAnswer = (optIndex) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedOpt(optIndex);

    const isCorrect = optIndex === questions[currentIndex].answer;
    if (isCorrect) {
      // Score calculation: Base (100) + Time Bonus (up to 50)
      const timeBonus = Math.floor((timeLeft / TIMER_SECONDS) * 50);
      setScore(prev => prev + 100 + timeBonus);
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOpt(null);
      setTimeLeft(TIMER_SECONDS);
    } else {
      setQuizFinished(true);
    }
  };

  if (!subject) return null;

  return (
    <>
      <Navbar />
      <main className="main-content">
        <div className="quiz-container">

          {/* State 1: Select Grade */}
          {!grade && (
            <GradeSelector subject={subject} onSelect={handleStart} />
          )}

          {/* State 2: Quiz Engine */}
          {grade && !quizFinished && questions.length > 0 && (
            <div className="anim-fade-up">

              {/* Header: Subject info + Progress + Timer */}
              <div className="quiz-header">
                <div className="quiz-subject-tag">
                  <div className="quiz-subject-icon" style={{ color: subject.color }}>{subject.icon}</div>
                  <div>
                    <div className="quiz-subject-name">{subject.name}</div>
                    <div className="quiz-grade-tag">Kelas {grade}</div>
                  </div>
                </div>

                <div className="quiz-progress-wrap">
                  <div className="progress-meta">
                    <span>Soal {currentIndex + 1} dari {questions.length}</span>
                    <span style={{ color: 'var(--amber)' }}>Skor: {score}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className={`quiz-timer ${timeLeft <= 5 ? 'danger' : timeLeft <= 10 ? 'warning' : ''}`}>
                  {timeLeft}
                </div>
              </div>

              {/* Question Card */}
              <div className="question-card">
                <div className="q-number">Soal Nomor {currentIndex + 1}</div>
                <h3 className="q-text">{questions[currentIndex].question}</h3>
              </div>

              {/* Options */}
              <div className="options-list">
                {questions[currentIndex].options.map((opt, idx) => {
                  const isCorrectAnswer = idx === questions[currentIndex].answer;
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

                  const letter = String.fromCharCode(65 + idx); // A, B, C, D...

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

              {/* Explanation (shows after answering) */}
              {isAnswered && (
                <div className="anim-scale">
                  <div className="explanation-box">
                    <strong>Pembahasan:</strong><br />
                    {questions[currentIndex].explanation}
                  </div>

                  <div style={{ marginTop: '24px', textAlign: 'right' }}>
                    <button
                      id="btn-next-question"
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      {currentIndex === questions.length - 1 ? 'Selesai & Lihat Hasil 🏁' : 'Soal Selanjutnya ➔'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* State 3: Result Screen */}
          {quizFinished && (
            <ResultScreen
              score={score}
              total={questions.length}
              correct={correctCount}
              subject={subject}
              grade={grade}
              onRetry={() => handleStart(grade)}
              onLeaderboard={() => router.push('/leaderboard')}
            />
          )}

        </div>
      </main>
    </>
  );
}
