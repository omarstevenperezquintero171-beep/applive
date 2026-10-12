// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Logo from './Logo';

const FOOTER_LINKS = {
  Productos: [
    { label: 'Studio 9:16', href: '/studio' },
    { label: 'Cámara en Vivo', href: '/camera-studio' },
    { label: 'Face Swap IA', href: '/face-swap' },
    { label: 'Clon de Voz & TTS', href: '/voice-clone' },
    { label: 'Avatar Streaming', href: '/live' },
    { label: 'Biblioteca', href: '/library' },
  ],
  Recursos: [
    { label: 'Precios', href: '/pricing' },
    { label: 'Blog', href: '#' },
    { label: 'Centro de Ayuda', href: '#' },
    { label: 'Tutoriales', href: '#' },
  ],
  Empresa: [
    { label: 'Sobre Nosotros', href: '#' },
    { label: 'Contacto', href: '#' },
    { label: 'Partners', href: '#' },
    { label: 'Afiliados', href: '#' },
  ],
  Legal: [
    { label: 'Términos de Uso', href: '#' },
    { label: 'Política de Privacidad', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
};

const SOCIAL_ICONS = [
  { label: 'TikTok', icon: '🎵', href: '#' },
  { label: 'Instagram', icon: '📸', href: '#' },
  { label: 'YouTube', icon: '▶️', href: '#' },
  { label: 'X (Twitter)', icon: '𝕏', href: '#' },
];

export default function Footer() {
  const year = 2026;

  return (
    <footer className="footer">
      <div className="container">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-brand">
            <Logo size="md" />
            <p className="footer-description">
              Plataforma de generación de videos con avatares hiperrealistas impulsados por IA. 
              Crea contenido vertical optimizado para TikTok, Reels y Shorts en segundos.
            </p>
            <div className="footer-socials">
              {SOCIAL_ICONS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  className="footer-social-link"
                  title={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-links-grid">
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category} className="footer-links-column">
                <h4 className="footer-links-title">{category}</h4>
                <ul className="footer-links-list">
                  {links.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="footer-cta">
          <div>
            <h3 className="footer-cta-title">
              ¿Listo para crear tu primer video con IA?
            </h3>
            <p className="footer-cta-desc">
              Comienza gratis con 3 videos de prueba. Sin tarjeta de crédito.
            </p>
          </div>
          <Link href="/studio" className="btn btn-primary btn-lg footer-cta-btn">
            Empieza Gratis →
          </Link>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} Mimik AI Studio. Todos los derechos reservados.
          </p>
          <div className="footer-badges">
            <span className="footer-badge">🔒 SSL Seguro</span>
            <span className="footer-badge">⚡ Tecnología IA</span>
            <span className="footer-badge">🌎 LATAM & España</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
