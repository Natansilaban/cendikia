export default function sitemap() {
  // Ganti URL ini dengan URL domain asli kamu nantinya (misal https://cendikia.vercel.app atau https://cendikia.com)
  const baseUrl = 'https://cendikia.vercel.app';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/play`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }
  ];
}
