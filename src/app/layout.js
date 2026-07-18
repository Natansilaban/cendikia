import './globals.css';

export const metadata = {
  title: 'Cendikia — Platform Quiz SMA/SMK Indonesia',
  description: 'Platform quiz pembelajaran SMA/SMK terbaik. Uji pengetahuanmu di 11 mata pelajaran, bersaing di leaderboard global, dan raih prestasi tertinggi!',
  keywords: 'quiz SMA, quiz SMK, belajar online, soal latihan, leaderboard, Matematika, Fisika, Kimia, Biologi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Nunito:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <footer style={{
          textAlign: 'center',
          padding: '24px',
          fontSize: '0.95rem',
          color: 'var(--text-mid)',
          fontWeight: 700,
          borderTop: '2px dashed var(--border)',
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(4px)',
          fontFamily: 'Outfit, sans-serif'
        }}>
          Made with ❤️ by <span style={{ color: 'var(--navy)', fontWeight: 900, textDecoration: 'underline', textDecorationColor: 'var(--amber)', textDecorationThickness: '2px' }}>Natan</span>
        </footer>
      </body>
    </html>
  );
}
