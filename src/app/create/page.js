'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { onAuthStateChanged, createCustomQuiz } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateQuizPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], answer: 0 }
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], answer: 0 }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return alert("Silakan login dulu!");
    
    // Validation
    if (!title.trim()) return alert("Judul quiz tidak boleh kosong");
    for (let i=0; i<questions.length; i++) {
      if (!questions[i].question.trim()) return alert(`Soal nomor ${i+1} kosong!`);
      if (questions[i].options.some(opt => !opt.trim())) return alert(`Ada opsi yang kosong di soal nomor ${i+1}!`);
    }

    setIsSubmitting(true);
    try {
      const quizId = await createCustomQuiz({
        title,
        questions,
      }, user.uid);
      
      router.push(`/play/${quizId}?created=true`);
    } catch (e) {
      alert("Gagal menyimpan quiz: " + e.message);
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <main className="main-content">
        <div className="create-container anim-fade-up">
          
          <div className="text-center" style={{ marginBottom: '32px' }}>
            <h1 className="heading-md">✍️ Buat Quiz Sendiri</h1>
            <p style={{ color: 'var(--text-mid)', fontWeight: 600 }}>Buat tantanganmu dan bagikan ke teman-teman!</p>
          </div>

          {!user ? (
            <div className="card text-center" style={{ padding: '40px 24px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔒</div>
              <h2 className="heading-sm">Fitur Terkunci</h2>
              <p style={{ marginBottom: '24px' }}>Kamu harus login dengan Google untuk bisa membuat quiz dan menyimpannya.</p>
              <Link href="/profile" className="btn btn-primary">Ke Halaman Profil untuk Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSave} className="anim-up" style={{ animationDelay: '0.1s' }}>
              <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '1.2rem' }}>Judul Quiz *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Latihan OSN Fisika, Quiz Sejarah Kemerdekaan..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ fontSize: '1.1rem', padding: '16px' }}
                    required
                  />
                </div>
              </div>

              {questions.map((q, qIndex) => (
                <div key={qIndex} className="card-soft" style={{ padding: '24px', marginBottom: '24px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="heading-sm" style={{ margin: 0, fontSize: '1.2rem' }}>Soal {qIndex + 1}</h3>
                    {questions.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveQuestion(qIndex)}
                        style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <textarea
                      className="form-input"
                      placeholder="Tuliskan pertanyaan di sini..."
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      rows="3"
                      required
                    ></textarea>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="form-group" style={{ margin: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <input 
                            type="radio" 
                            name={`correct-${qIndex}`} 
                            checked={q.answer === oIndex}
                            onChange={() => handleQuestionChange(qIndex, 'answer', oIndex)}
                            id={`opt-${qIndex}-${oIndex}`}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--amber)' }}
                          />
                          <label htmlFor={`opt-${qIndex}-${oIndex}`} style={{ fontWeight: 700, cursor: 'pointer' }}>
                            Pilihan {String.fromCharCode(65 + oIndex)} {q.answer === oIndex && <span style={{ color: 'var(--success)' }}>(Jawaban Benar)</span>}
                          </label>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={`Teks pilihan ${String.fromCharCode(65 + oIndex)}...`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleAddQuestion}
                  style={{ flex: 1 }}
                >
                  + Tambah Soal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmitting}
                  style={{ flex: 1 }}
                >
                  {isSubmitting ? 'Menyimpan...' : '💾 Simpan & Dapatkan Link'}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      <style jsx>{`
        .create-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        @media (max-width: 600px) {
          .create-container .card-soft > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
