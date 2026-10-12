// src/components/Navbar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from './Logo';
import type { Profile } from '@/types';

interface NavbarProps {
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && isMounted) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (isMounted) setProfile(data);
      }
      if (isMounted) setLoading(false);
    }

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (isMounted) setProfile(data);
      } else {
        if (isMounted) setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/');
  };

  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setIsMegaMenuOpen(false), 220);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      backgroundColor: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      <div
        className="container"
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* LADO IZQUIERDO: LOGO + BOTÓN DROPDOWN DE PRODUCTOS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Logo size="sm" />
          </Link>

          {/* Menú Desplegable Productos */}
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative' }}
          >
            <button
              type="button"
              onClick={() => setIsMegaMenuOpen(prev => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: isMegaMenuOpen ? '#ffffff' : '#cbd5e1',
                background: isMegaMenuOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '6px 12px',
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>Productos</span>
              <span style={{
                fontSize: 9,
                fontWeight: 900,
                background: '#ef4444',
                color: '#fff',
                padding: '1px 5px',
                borderRadius: 10,
                letterSpacing: '0.5px'
              }}>
                NUEVO
              </span>
              <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
            </button>

            {/* MEGA MENU DROPDOWN (4 COLUMNS EXACTLY AS SPECIFIED) */}
            {isMegaMenuOpen && (
              <div
                className="mega-menu-container"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 8,
                  zIndex: 200,
                  width: 880,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 16,
                  padding: 20,
                  background: 'rgba(11, 15, 26, 0.96)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 18,
                  boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 40px rgba(99,102,241,0.15)'
                }}
              >
                {/* 1. EN VIVO */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    En Vivo
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Link href="/studio/camara-en-vivo" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">📹 Cámara en Vivo</span>
                        <span className="mega-badge mega-badge-new">Nuevo</span>
                      </div>
                      <p className="mega-item-desc">Editor de cámara interactiva con fondos y filtros.</p>
                    </Link>
                    <Link href="/studio/avatar-streaming" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">🔴 Avatar Streaming</span>
                      </div>
                      <p className="mega-item-desc">Interacción en directo con micrófono y chat.</p>
                    </Link>
                    <Link href="/studio/agente-ventas" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">🤖 Agente de Ventas</span>
                      </div>
                      <p className="mega-item-desc">Soporte comercial con avatar conversacional.</p>
                    </Link>
                    <Link href="/studio/face-swap-live" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">🔄 Face Swap Live</span>
                      </div>
                      <p className="mega-item-desc">Reemplazo facial sobre streaming WebRTC.</p>
                    </Link>
                  </div>
                </div>

                {/* 2. VÍDEO */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    Vídeo
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Link href="/studio/imagen-a-video" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">📱 Imagen a Video</span>
                        <span className="mega-badge mega-badge-hot">9:16</span>
                      </div>
                      <p className="mega-item-desc">Convierte fotos en videos con lip-sync.</p>
                    </Link>
                    <Link href="/studio/avatar-parlante" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">🗣️ Avatar Parlante</span>
                      </div>
                      <p className="mega-item-desc">Presentador virtual con guión de texto.</p>
                    </Link>
                    <Link href="/studio/formato-vertical" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">📐 Formato Vertical</span>
                      </div>
                      <p className="mega-item-desc">Optimizado para retención en TikTok y Reels.</p>
                    </Link>
                    <Link href="/studio/guion-a-video" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">📄 Guión a Video</span>
                      </div>
                      <p className="mega-item-desc">Historias estructuradas con prompts de IA.</p>
                    </Link>
                    <Link href="/studio/video-a-video" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">🎬 Video a Video</span>
                      </div>
                      <p className="mega-item-desc">Reimagina estilo y presentador de tu video.</p>
                    </Link>
                  </div>
                </div>

                {/* 3. AUDIO & VOZ */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    Audio & Voz
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Link href="/studio/texto-a-voz" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">🎙️ Texto a Voz (TTS)</span>
                      </div>
                      <p className="mega-item-desc">Voces nativas en español (varios acentos).</p>
                    </Link>
                    <Link href="/studio/clon-de-voz" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">🧬 Clon de Voz</span>
                        <span className="mega-badge mega-badge-new">ElevenLabs</span>
                      </div>
                      <p className="mega-item-desc">Clona tu voz con 30s de muestra de audio.</p>
                    </Link>
                    <Link href="/studio/subtitulos-tiktok" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">💬 Subtítulos TikTok</span>
                      </div>
                      <p className="mega-item-desc">Subtítulos dinámicos de alto contraste.</p>
                    </Link>
                    <Link href="/studio/efectos-sonido" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">🎧 Efectos de Sonido</span>
                      </div>
                      <p className="mega-item-desc">Efectos SFX instantáneos para directos.</p>
                    </Link>
                  </div>
                </div>

                {/* 4. IMAGEN & FONDOS & API */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    Imagen & API
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Link href="/studio/cambio-de-fondo" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">🖼️ Cambio de Fondo</span>
                      </div>
                      <p className="mega-item-desc">Estudios oscuros, gradientes o imagen propia.</p>
                    </Link>
                    <Link href="/studio/retrato-personalizado" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">📸 Retrato Face Swap</span>
                      </div>
                      <p className="mega-item-desc">Intercambio de rostros en alta resolución.</p>
                    </Link>
                    <Link href="/gestor-videos" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">📁 Gestor de Videos</span>
                      </div>
                      <p className="mega-item-desc">Historial de descargas MP4 y compartición.</p>
                    </Link>
                    <Link href="/api-docs" className="mega-item" onClick={() => setIsMegaMenuOpen(false)}>
                      <div className="mega-item-header">
                        <span className="mega-item-title">⚡ API Docs</span>
                        <span className="mega-badge mega-badge-unlimited">REST</span>
                      </div>
                      <p className="mega-item-desc">Automatización de video para empresas.</p>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTRO: NAVEGACIÓN EN UNA SOLA LÍNEA (4-5 ENLACES CLAVE) */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          fontSize: 13,
          fontWeight: 600,
          color: '#94a3b8',
          whiteSpace: 'nowrap',
        }}>
          <Link
            href="/studio"
            style={{
              color: pathname.startsWith('/studio') && !pathname.includes('avatar-streaming') && !pathname.includes('imagen-a-video') ? '#ffffff' : '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
          >
            Studio 9:16
          </Link>

          <Link
            href="/studio/avatar-streaming"
            style={{
              color: pathname.includes('avatar-streaming') ? '#ffffff' : '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
          >
            En Vivo
          </Link>

          <Link
            href="/studio/imagen-a-video"
            style={{
              color: pathname.includes('imagen-a-video') ? '#ffffff' : '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
          >
            Herramientas IA
          </Link>

          <Link
            href="/gestor-videos"
            style={{
              color: pathname === '/gestor-videos' || pathname === '/library' ? '#ffffff' : '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
          >
            Biblioteca
          </Link>

          <Link
            href="/precios"
            style={{
              color: pathname === '/precios' || pathname === '/pricing' ? '#ffffff' : '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
          >
            Precios
          </Link>
        </nav>

        {/* LADO DERECHO: ACCIONES UNIFICADAS Y ELEGANTES */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Selector de Idioma Minimalista */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px 6px',
            userSelect: 'none'
          }}>
            <span>🌐</span>
            <span style={{ fontWeight: 600 }}>ES</span>
          </div>

          {!loading && (
            profile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Badge Sobrio de Estado */}
                <Link href="/precios" style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#c084fc',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    padding: '4px 10px',
                    borderRadius: 14
                  }}>
                    <span>⚡</span>
                    <span>{profile.credits_remaining} Créditos</span>
                  </div>
                </Link>

                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#fff'
                }}>
                  {(profile.full_name || profile.email || 'U')[0].toUpperCase()}
                </div>

                <button
                  className="btn btn-ghost btn-xs"
                  onClick={handleLogout}
                  style={{ color: '#94a3b8', fontSize: 12 }}
                >
                  Salir
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link
                  href="/login"
                  style={{
                    color: '#cbd5e1',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '6px 12px',
                  }}
                >
                  Iniciar Sesión
                </Link>

                {/* Botón Único Elegante: Empezar Gratis */}
                <Link
                  href="/registro"
                  className="btn btn-primary btn-sm"
                  style={{
                    borderRadius: 10,
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                    textDecoration: 'none',
                    color: '#ffffff'
                  }}
                >
                  Empezar Gratis
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
