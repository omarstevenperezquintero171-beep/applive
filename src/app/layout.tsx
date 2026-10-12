import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AvatarAI Studio | Genera Videos con IA',
  description: 'Plataforma de generación de videos con avatares hiperrealistas. Optimizado para TikTok y Facebook Reels.',
  keywords: 'avatar IA, video generado, TikTok, reels, studio IA',
  openGraph: {
    title: 'AvatarAI Studio',
    description: 'Genera videos con avatares de IA en segundos',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="page-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
