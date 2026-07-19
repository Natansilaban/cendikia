export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // Jangan index endpoint API
    },
    // Ganti URL ini dengan URL domain asli kamu nantinya
    sitemap: 'https://cendikia.vercel.app/sitemap.xml',
  }
}
