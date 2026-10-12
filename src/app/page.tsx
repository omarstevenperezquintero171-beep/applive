'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';

const HERO_TAGS = [
  { id: 'tag_stream', label: 'avatar en streaming', href: '/live' },
  { id: 'tag_realtime', label: 'avatar en tiempo real', href: '/live' },
  { id: 'tag_916', label: 'avatares de IA 9:16', href: '/studio' },
  { id: 'tag_digital', label: 'avatar de inteligencia artificial digital', href: '/studio' },
  { id: 'tag_clon', label: 'clonación de voz ElevenLabs', href: '/pricing' },
  { id: 'tag_tiktok', label: 'subtítulos animados estilo TikTok', href: '/studio' },
  { id: 'tag_genai', label: 'vídeos de gen ai', href: '/studio' },
];

const TOOLS_CATALOG = [
  {
    category: 'En Vivo',
    badge: 'Nuevo',
    badgeType: 'new',
    icon: '🔴',
    title: 'Avatar en Streaming en Vivo',
    desc: 'Interacciones de IA en tiempo real mediante WebRTC con latencia menor a 300ms y respuestas por micrófono.',
    link: '/live',
    buttonText: 'Probar en Directo →',
  },
  {
    category: 'En Vivo',
    badge: 'Caliente',
    badgeType: 'hot',
    icon: '📹',
    title: 'Cámara en Vivo con Lip-Sync',
    desc: 'Interpretación y sincronización de labios simultánea en reuniones y transmisiones en directo.',
    link: '/live',
    buttonText: 'Conectar Cámara →',
  },
  {
    category: 'Video',
    badge: 'Más Usado',
    badgeType: 'hot',
    icon: '📱',
    title: 'Studio Avatar 9:16 Vertical',
    desc: 'Convierte fotos en videos hiperrealistas optimizados para el algoritmo de TikTok, Reels y Shorts.',
    link: '/studio',
    buttonText: 'Abrir Studio 9:16 →',
  },
  {
    category: 'Video',
    badge: 'Ilimitado',
    badgeType: 'unlimited',
    icon: '🗣️',
    title: 'Foto y Avatar Parlante',
    desc: 'Sube cualquier selfie, retrato o personaje y anímalo sincronizando labios con cualquier texto o audio.',
    link: '/studio',
    buttonText: 'Animar Foto →',
  },
  {
    category: 'Video',
    badge: 'IA Viral',
    badgeType: 'new',
    icon: '💡',
    title: 'Generador de Guiones IA',
    desc: 'Crea ganchos virales de alta retención para TikTok y copys de ventas en segundos según tu nicho.',
    link: '/studio',
    buttonText: 'Crear Guión →',
  },
  {
    category: 'Audio',
    badge: 'ElevenLabs',
    badgeType: 'new',
    icon: '🧬',
    title: 'Clonación de Voz Ultrarrealista',
    desc: 'Crea una versión digital de tu propia voz o elige entre docenas de acentos nativos en español.',
    link: '/pricing',
    buttonText: 'Clonar Voz →',
  },
  {
    category: 'Audio',
    badge: 'TikTok Style',
    badgeType: 'hot',
    icon: '💬',
    title: 'Subtítulos Animados Automáticos',
    desc: 'Subtítulos con colores llamativos (MrBeast yellow, cyan) que aumentan el engagement de video en un 80%.',
    link: '/studio',
    buttonText: 'Ver Estilos →',
  },
  {
    category: 'Imagen',
    badge: 'Estudio',
    badgeType: 'unlimited',
    icon: '🎭',
    title: 'Intercambio de Rostros (Face Swap)',
    desc: 'Reemplazo facial de alta fidelidad fotográfica manteniendo expresiones e iluminación natural.',
    link: '/studio',
    buttonText: 'Probar Face Swap →',
  },
  {
    category: 'Imagen',
    badge: 'B-Roll',
    badgeType: 'unlimited',
    icon: '🎬',
    title: 'Fondos Dinámicos & B-Roll',
    desc: 'Reemplaza el fondo de tu video por sets de oficina, gradientes futuristas o imágenes generadas por IA.',
    link: '/studio',
    buttonText: 'Editar Fondos →',
  },
  {
    category: 'En Vivo',
    badge: 'Agente',
    badgeType: 'new',
    icon: '💼',
    title: 'Agente de Ventas y Soporte 24/7',
    desc: 'Configura un avatar que atienda a tus clientes respondiendo dudas y cerrando ventas automáticamente.',
    link: '/live',
    buttonText: 'Configurar Agente →',
  },
  {
    category: 'Video',
    badge: 'Traducción',
    badgeType: 'new',
    icon: '🌐',
    title: 'Doblaje y Traducción con Lip-Sync',
    desc: 'Traduce tus videos a más de 20 idiomas adaptando el movimiento de los labios al nuevo idioma.',
    link: '/studio',
    buttonText: 'Traducir Video →',
  },
  {
    category: 'Imagen',
    badge: 'Pro API',
    badgeType: 'hot',
    icon: '⚡',
    title: 'API para Automatización Masiva',
    desc: 'Genera miles de videos personalizados para campañas de email marketing o redes sociales vía API REST.',
    link: '/pricing',
    buttonText: 'Ver Documentación API →',
  },
];

export default function HomePage() {
  const [activeCatalogTab, setActiveCatalogTab] = useState<string>('Todas');
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({ open: false, tab: 'login' });

  const filteredTools = activeCatalogTab === 'Todas'
    ? TOOLS_CATALOG
    : TOOLS_CATALOG.filter(t => t.category === activeCatalogTab);

  return (
    <>
      <Navbar onOpenAuth={(tab) => setAuthModal({ open: true, tab })} />

      {/* 1. AKOOL-STYLE HERO SECTION */}
      <section style={{ padding: '40px 0 60px', overflow: 'hidden' }}>
        <div className="container">
          {/* Breadcrumb Trail */}
          <div className="breadcrumb-trail">
            <Link href="/" className="breadcrumb-item">Nuestras herramientas</Link>
            <span>›</span>
            <Link href="/studio" className="breadcrumb-item">Avatares de vídeo</Link>
            <span>›</span>
            <span className="breadcrumb-active">Avatares de transmisión en tiempo real & 9:16</span>
          </div>

          {/* Hero Grid: Left Content / Right 3D Visual Stage */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.9fr)',
            gap: 40,
            alignItems: 'center'
          }}>
            {/* LEFT CONTENT */}
            <div>
              <h1 style={{
                fontSize: 'clamp(34px, 4.4vw, 56px)',
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: '-1.5px',
                marginBottom: 20
              }}>
                Avatares de transmisión <br />
                <span className="text-gradient">en tiempo real</span> & videos 9:16
              </h1>

              <p style={{
                fontSize: 17,
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: 580,
                marginBottom: 24
              }}>
                Da vida a tus ideas con avatares de IA dinámicos y personalizables, que mejoran la participación y la narración de historias para creadores, marcas y agencias.
              </p>

              {/* Tag Chips Row (Akool style) */}
              <div className="tag-pills-row">
                {HERO_TAGS.map(tag => (
                  <Link key={tag.id} href={tag.href} className="tag-pill">
                    {tag.label}
                  </Link>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <Link
                  href="/studio"
                  className="btn btn-primary btn-lg"
                  style={{
                    borderRadius: 24,
                    padding: '14px 32px',
                    fontSize: 16,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                    boxShadow: '0 8px 30px rgba(124, 58, 237, 0.45)',
                    textDecoration: 'none'
                  }}
                >
                  Empieza gratis &gt;
                </Link>

                <Link
                  href="/live"
                  className="btn btn-secondary btn-lg"
                  style={{
                    borderRadius: 24,
                    padding: '14px 28px',
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <span>🔴</span> Ver Avatar en Vivo
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
                <span>🎁 3 videos gratis al instante</span>
                <span>•</span>
                <span>⚡ Sin tarjeta de crédito</span>
                <span>•</span>
                <span>📱 Formato vertical TikTok & Reels</span>
              </div>
            </div>

            {/* RIGHT: AKOOL 3D VISUAL GRAPHIC STAGE */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="hero-3d-stage">
                {/* Back card */}
                <div className="stage-card-back">
                  <span style={{ fontSize: 44, marginBottom: 12 }}>🎙️</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>ElevenLabs Voices</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Clonación en 60s</p>
                  <div style={{ marginTop: 20, display: 'flex', gap: 4 }}>
                    {[16, 28, 42, 30, 20, 36, 18, 40].map((h, idx) => (
                      <div key={idx} style={{ width: 4, height: h, borderRadius: 2, background: 'var(--primary-light)' }} />
                    ))}
                  </div>
                </div>

                {/* Toroid rings */}
                <div className="stage-ring" />

                {/* Front main card */}
                <div className="stage-card-front">
                  {/* Top status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      padding: '4px 10px', borderRadius: 20,
                      background: 'rgba(239, 68, 68, 0.85)',
                      fontSize: 11, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                      STREAMING EN VIVO
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Latencia: 240ms</span>
                  </div>

                  {/* Character Avatar Center */}
                  <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                    <div style={{
                      width: 100, height: 100, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1e3a5f, #2d6a9f)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 50, border: '3px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                      animation: 'pulse 2s infinite'
                    }}>
                      👨‍💼
                    </div>

                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 12 }}>Carlos · Closer IA</h4>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                      Respondiendo en tiempo real por WebRTC
                    </p>
                  </div>

                  {/* Bottom Speech Balloon */}
                  <div style={{
                    padding: '10px 14px', borderRadius: 14,
                    background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#fef08a', lineHeight: 1.4 }}>
                      &ldquo;¡Hola! Estoy listo para presentar tus productos en TikTok y cerrar más ventas.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATÁLOGO COMPLETO DE HERRAMIENTAS IA (MÁS FUNCIONES QUE AKOOL) */}
      <section style={{ padding: '60px 0 80px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(99,102,241,0.02)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 36px' }}>
            <span style={{
              fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '4px 12px', borderRadius: 20, background: 'rgba(168,85,247,0.15)', color: '#c084fc'
            }}>
              ✨ Suite Creativa Completa
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 900, marginTop: 12, marginBottom: 8 }}>
              Todas las Herramientas que Necesitas para <span className="text-gradient">Dominar Redes</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              Generación de video, streaming en directo, síntesis de voz, subtítulos automáticos y más.
            </p>
          </div>

          {/* Catalog Filter Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
            {['Todas', 'En Vivo', 'Video', 'Audio', 'Imagen'].map(tab => (
              <button
                key={tab}
                type="button"
                className={`btn btn-sm ${activeCatalogTab === tab ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 20, padding: '8px 20px', fontWeight: 700, fontSize: 13 }}
                onClick={() => setActiveCatalogTab(tab)}
              >
                {tab === 'Todas' ? '🔥 Todas las Herramientas' : tab === 'En Vivo' ? '🔴 En Vivo & Streaming' : tab === 'Video' ? '📱 Video 9:16' : tab === 'Audio' ? '🎙️ Audio & Voz' : '🖼️ Imagen & Rostros'}
              </button>
            ))}
          </div>

          {/* Tools Grid (Akool-style product tiles) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20
          }}>
            {filteredTools.map((tool, idx) => (
              <Link
                key={idx}
                href={tool.link}
                className="card card-hover"
                style={{
                  padding: 22,
                  borderRadius: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(13, 20, 40, 0.65)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                  }}>
                    {tool.icon}
                  </div>

                  <span className={`mega-badge ${
                    tool.badgeType === 'hot' ? 'mega-badge-hot' : tool.badgeType === 'new' ? 'mega-badge-new' : 'mega-badge-unlimited'
                  }`}>
                    {tool.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: '#fff' }}>
                  {tool.title}
                </h3>

                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20, flex: 1 }}>
                  {tool.desc}
                </p>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, fontWeight: 700, color: 'var(--primary-light)', marginTop: 'auto'
                }}>
                  <span>{tool.buttonText}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE VERTICAL 9:16 (TIKTOK & REELS DEMOS) */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800 }}>
              Diseñado para Creadores de <span className="text-gradient">TikTok, Reels & Shorts</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
              Videos con relación de aspecto 9:16 nativa, listos para exportar y publicar sin recorte.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {[
              { emoji: '👨‍💼', title: 'Pitch B2B Viral', views: '340K', bg: 'linear-gradient(180deg,#1e3a5f,#0d1b2a)' },
              { emoji: '👩‍🏫', title: 'Tutorial Paso a Paso', views: '190K', bg: 'linear-gradient(180deg,#4a1c6e,#1a0a2e)' },
              { emoji: '🧑‍💻', title: 'Demo de SaaS & Apps', views: '450K', bg: 'linear-gradient(180deg,#1a3a2e,#0a1a14)' },
              { emoji: '👩‍🎨', title: 'Contenido de Influencer', views: '820K', bg: 'linear-gradient(180deg,#5c1a1a,#1a0808)' },
            ].map((demo, idx) => (
              <Link
                key={idx}
                href="/studio"
                style={{
                  width: 180, height: 320, borderRadius: 22,
                  background: demo.bg,
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                  textDecoration: 'none',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  transform: idx % 2 === 0 ? 'translateY(-10px)' : 'translateY(10px)',
                  transition: 'transform 0.3s ease, border-color 0.3s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = idx % 2 === 0 ? 'translateY(-10px)' : 'translateY(10px)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <span style={{ fontSize: 50 }}>{demo.emoji}</span>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '16px 12px 12px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.9))'
                }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{demo.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>👁 {demo.views} vistas</p>
                </div>
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.85)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: '#fff'
                }}>▶</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA BANNER */}
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{
            background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, rgba(9,13,24,0.9) 70%)',
            border: '1px solid rgba(168,85,247,0.4)',
            borderRadius: 30, padding: '60px 32px', maxWidth: 760, margin: '0 auto',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(124,58,237,0.2)'
          }}>
            <h2 style={{ fontSize: 38, fontWeight: 900, marginBottom: 14 }}>
              Empieza a Crear con <span className="text-gradient">AvatarAI Hoy Mismo</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 540, margin: '0 auto 32px' }}>
              Pruébalo con 3 videos gratuitos sin tarjeta de crédito. Acceso completo a Studio 9:16 y Streaming en directo.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/studio"
                className="btn btn-primary btn-xl"
                style={{
                  borderRadius: 24, padding: '16px 36px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                  fontWeight: 800
                }}
              >
                🎬 Abrir Studio de Creación
              </Link>
              <Link
                href="/pricing"
                className="btn btn-secondary btn-xl"
                style={{ borderRadius: 24, padding: '16px 32px', fontWeight: 700 }}
              >
                💎 Ver Planes & Precios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '32px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            © 2026 AvatarAI Studio · Plataforma de Video Avatar IA & Streaming en Vivo para TikTok, Reels y Shorts.
          </p>
        </div>
      </footer>

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal(prev => ({ ...prev, open: false }))}
        defaultTab={authModal.tab}
      />
    </>
  );
}
