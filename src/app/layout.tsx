import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mimik AI | Videos con Avatares IA & Streaming en Vivo',
  description: 'Plataforma SaaS de videos hiperrealistas con avatares de IA y streaming interactivo. Edición vertical 9:16 optimizada para TikTok, Instagram Reels y YouTube Shorts.',
  keywords: 'Mimik AI, avatar IA, video generado, streaming avatar, TikTok, reels, studio IA, face swap, teleprompter, inteligencia artificial',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Mimik AI — Videos con Avatares IA & Streaming',
    description: 'Genera videos hiperrealistas con avatares IA y streaming interactivo en segundos. Optimizado para TikTok, Reels y Shorts.',
    type: 'website',
    siteName: 'Mimik AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mimik AI Studio',
    description: 'Crea videos virales con avatares de IA en formato vertical 9:16 y streaming en vivo',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>
        <div className="page-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
