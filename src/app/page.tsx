'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';

const FEATURES = [
  { icon: '🎭', title: 'Avatares Hiperrealistas', desc: 'Sube una foto o selecciona personajes del catálogo con animación facial sincrónica (HeyGen & D-ID).' },
  { icon: '🎙️', title: 'Voces con ElevenLabs', desc: 'Síntesis de voz ultra-natural en español y clonación de tu propia voz para máxima autenticidad.' },
  { icon: '📱', title: 'Formato Vertical 9:16', desc: 'Videos optimizados para el algoritmo de retención de TikTok, Instagram Reels y Facebook Reels.' },
  { icon: '🔴', title: 'Avatar Interactivo en Vivo', desc: 'Conecta con tus seguidores en streaming en tiempo real y responde preguntas por micrófono y chat.' },
  { icon: '💬', title: 'Subtítulos Animados', desc: 'Generación automática de subtítulos estilo TikTok de alto contraste para atrapar a la audiencia.' },
  { icon: '💡', title: 'Generador de Guiones IA', desc: 'Crea ganchos virales y copys de ventas en segundos según tu objetivo y nicho de mercado.' },
];

const EXAMPLES = [
  { emoji: '👨‍💼', title: 'Pitch de Ventas B2B', views: '284K', bg: 'linear-gradient(180deg,#1e3a5f,#0d1b2a)' },
  { emoji: '👩‍🏫', title: 'Tutorial & Educación', views: '149K', bg: 'linear-gradient(180deg,#4a1c6e,#1a0a2e)' },
  { emoji: '🧑‍💻', title: 'Demo de Producto Tech', views: '320K', bg: 'linear-gradient(180deg,#1a3a2e,#0a1a14)' },
  { emoji: '👩‍🎨', title: 'Contenido Viral Reels', views: '710K', bg: 'linear-gradient(180deg,#5c1a1a,#1a0808)' },
];

export default function HomePage() {
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({ open: false, tab: 'login' });

  return (
    <>
      <Navbar onOpenAuth={(tab) => setAuthModal({ open: true, tab })} />

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-chip">
            <span>🚀</span>
            <span>AI Video Creator & Live Avatar Interactive Studio · 3 Videos Gratis</span>
          </div>

          <h1 className="hero-title">
            Crea Videos con{' '}
            <span className="text-gradient">Avatares IA</span>
            <br />para TikTok & Reels
          </h1>

          <p className="hero-subtitle">
            Convierte cualquier foto o personaje en un presentador hiperrealista con voz en español, subtítulos automáticos y streaming interactivo en directo.
          </p>

          <div className="hero-cta">
            <Link href="/studio" className="btn btn-primary btn-xl">
              🎬 Abrir Studio AI Gratis
            </Link>
            <Link href="/live" className="btn btn-secondary btn-xl" style={{ border: '1px solid rgba(236,72,153,0.4)', background: 'rgba(236,72,153,0.08)' }}>
              🔴 Probar Avatar en Vivo
            </Link>
          </div>

          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            🎁 3 videos de prueba gratuita de inmediato · Sin tarjeta requerida
          </p>
        </div>
      </section>

      {/* VIDEO PREVIEWS SHOWCASE */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {EXAMPLES.map((ex, i) => (
              <Link
                key={i}
                href="/studio"
                style={{
                  width: 170, height: 300, borderRadius: 22,
                  background: ex.bg,
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  transform: i % 2 === 0 ? 'translateY(-10px)' : 'translateY(10px)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = i % 2 === 0 ? 'translateY(-10px)' : 'translateY(10px)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <span style={{ fontSize: 48 }}>{ex.emoji}</span>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '20px 12px 14px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.85))'
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{ex.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>👁 {ex.views} vistas</p>
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

      {/* LIVE STREAMING BANNER */}
      <section style={{ padding: '40px 0 60px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(99,102,241,0.12))',
            border: '1px solid rgba(236,72,153,0.3)',
            borderRadius: 24, padding: '36px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap'
          }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 12, background: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: 11, fontWeight: 800, marginBottom: 10 }}>
                <span>🔴 NUEVO</span> Live WebRTC Avatar Streaming
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
                Habla con tu Avatar en <span className="text-gradient">Tiempo Real</span>
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Convierte a tus avatares en agentes conversacionales en directo. Responde preguntas de clientes, realiza capacitaciones interactivas o asiste a tus usuarios con latencia menor a 300ms.
              </p>
            </div>

            <Link href="/live" className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', whiteSpace: 'nowrap' }}>
              🔴 Abrir Live Streaming Studio →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '60px 0 80px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <span className="badge badge-primary" style={{ marginBottom: 16 }}>✨ Plataforma Todo-En-Uno</span>
            <h2 className="section-title">Tecnología de punta para <span className="text-gradient">creadores y empresas</span></h2>
            <p className="section-subtitle">Potenciado por D-ID, HeyGen, ElevenLabs y modelos de lenguaje de última generación</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card card-hover p-6" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '60px 0', background: 'rgba(99,102,241,0.04)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="stats-grid">
            {[
              { num: '50K+', label: 'Videos Generados' },
              { num: '12K+', label: 'Creadores en TikTok & Reels' },
              { num: '<300ms', label: 'Latencia Live Streaming' },
              { num: '<90 seg', label: 'Tiempo de Render 9:16' },
            ].map((s, i) => (
              <div key={i} className="stat-card card" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div className="stat-number">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)',
            border: '1px solid var(--border-glow-blue)',
            borderRadius: 28, padding: '60px 40px', maxWidth: 700, margin: '0 auto'
          }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>
              Crea tu primer video con <span className="text-gradient">IA ahora mismo</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>
              3 videos gratuitos en modo prueba. Sin esperas, sin instalación previa.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/studio" className="btn btn-primary btn-xl">
                🎬 Abrir Studio de Edición
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-xl">
                💎 Ver Planes & Precios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '28px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            © 2026 AvatarAI Studio · Plataforma de Video Avatar IA & Streaming en Vivo
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
