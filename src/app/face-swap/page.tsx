// src/app/face-swap/page.tsx
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

const TARGET_PRESETS = [
  { id: 'tgt_cyber', title: 'Cyberpunk Protagonist', emoji: '🧑‍🎤', bg: 'linear-gradient(135deg, #1e1b4b, #4338ca)', category: 'Sci-Fi' },
  { id: 'tgt_ceo', title: 'Tech CEO Forbes Cover', emoji: '👨‍💼', bg: 'linear-gradient(135deg, #0f172a, #1e293b)', category: 'Negocios' },
  { id: 'tgt_hollywood', title: 'Hollywood Gala Star', emoji: '💃', bg: 'linear-gradient(135deg, #450a0a, #991b1b)', category: 'Moda' },
  { id: 'tgt_athlete', title: 'Fitness Influencer Pro', emoji: '🏃‍♂️', bg: 'linear-gradient(135deg, #064e3b, #047857)', category: 'Deportes' },
  { id: 'tgt_retro', title: 'Vintage 90s Polaroid', emoji: '📸', bg: 'linear-gradient(135deg, #713f12, #ca8a04)', category: 'Retro' },
  { id: 'tgt_anime', title: 'Cinematic 3D Character', emoji: '🧝', bg: 'linear-gradient(135deg, #581c87, #9333ea)', category: '3D Art' },
];

const SOURCE_FACES = [
  { id: 'src_alex', name: 'Alex M.', emoji: '🧑', note: 'Selfie Frontal' },
  { id: 'src_elena', name: 'Elena R.', emoji: '👩', note: 'Retrato Estudio' },
  { id: 'src_lucas', name: 'Lucas T.', emoji: '🧔', note: 'Foto Luz Natural' },
  { id: 'src_mia', name: 'Mía S.', emoji: '👱‍♀️', note: 'Selfie Cámara HD' },
];

export default function FaceSwapPage() {
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({
    open: false,
    tab: 'login',
  });

  const [selectedTarget, setSelectedTarget] = useState('tgt_cyber');
  const [customTargetImg, setCustomTargetImg] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState('src_alex');
  const [customSourceImg, setCustomSourceImg] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [resultReady, setResultReady] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const [enhanceFace, setEnhanceFace] = useState(true);

  const targetInputRef = useRef<HTMLInputElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  const currentTarget = TARGET_PRESETS.find(t => t.id === selectedTarget) || TARGET_PRESETS[0];
  const currentSource = SOURCE_FACES.find(s => s.id === selectedSource) || SOURCE_FACES[0];

  const handleStartSwap = () => {
    setIsProcessing(true);
    setProgress(15);
    setStatusMsg('Detectando puntos de referencia faciales (68 landmarks)...');

    setTimeout(() => {
      setProgress(45);
      setStatusMsg('Alineando ángulo 3D y compensación de perspectiva...');
    }, 1100);

    setTimeout(() => {
      setProgress(75);
      setStatusMsg('Fusionando tonos de piel y texturas HD...');
    }, 2200);

    setTimeout(() => {
      setProgress(100);
      setStatusMsg('¡Intercambio de rostro completado con éxito!');
      setIsProcessing(false);
      setResultReady(true);
    }, 3200);
  };

  return (
    <>
      <Navbar onOpenAuth={tab => setAuthModal({ open: true, tab })} />

      <main style={{ minHeight: 'calc(100vh - 140px)', padding: '32px 0 60px', background: 'var(--bg-base)' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 20, background: 'rgba(236,72,153,0.15)', color: '#ec4899', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              HyperSwap Neural Engine
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginTop: 12, marginBottom: 8 }}>
              Face Swap <span className="text-gradient">con Inteligencia Artificial</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto' }}>
              Intercambia cualquier rostro en fotos y escenas cinematográficas manteniendo expresiones hiperrealistas, iluminación y ángulo natural.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* Step 1: Target Image */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🎯</span> 1. Imagen Objetivo (Cuerpo o Escena)
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Donde se insertará el nuevo rostro
                  </p>
                </div>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => targetInputRef.current?.click()}
                >
                  📁 Subir Imagen
                </button>
                <input
                  ref={targetInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = ev => {
                        setCustomTargetImg(ev.target?.result as string);
                        setResultReady(false);
                      };
                      r.readAsDataURL(f);
                    }
                  }}
                />
              </div>

              {/* Target Preview Box */}
              <div style={{
                height: 240,
                borderRadius: 16,
                background: customTargetImg ? `url(${customTargetImg}) center/cover no-repeat` : currentTarget.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                border: '1px solid var(--border-subtle)',
                marginBottom: 16,
                position: 'relative'
              }}>
                {!customTargetImg && (
                  <>
                    <span style={{ fontSize: 60 }}>{currentTarget.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 8 }}>{currentTarget.title}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{currentTarget.category}</span>
                  </>
                )}
                {customTargetImg && (
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setCustomTargetImg(null)}
                    style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)' }}
                  >
                    ✕ Quitar
                  </button>
                )}
              </div>

              {/* Target Presets Grid */}
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                O elige una escena predeterminada:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {TARGET_PRESETS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTarget(t.id); setCustomTargetImg(null); setResultReady(false); }}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: selectedTarget === t.id && !customTargetImg ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 600
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{t.emoji}</span>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                      {t.title.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Source Face */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>👤</span> 2. Rostro Origen (Tu Foto)
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    El rostro que deseas transferir a la escena
                  </p>
                </div>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => sourceInputRef.current?.click()}
                >
                  📁 Subir Selfie
                </button>
                <input
                  ref={sourceInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = ev => {
                        setCustomSourceImg(ev.target?.result as string);
                        setResultReady(false);
                      };
                      r.readAsDataURL(f);
                    }
                  }}
                />
              </div>

              {/* Source Preview Box */}
              <div style={{
                height: 240,
                borderRadius: 16,
                background: customSourceImg ? `url(${customSourceImg}) center/cover no-repeat` : 'radial-gradient(circle at 50% 50%, #311042, #09090b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                border: '1px solid var(--border-subtle)',
                marginBottom: 16,
                position: 'relative'
              }}>
                {!customSourceImg && (
                  <>
                    <span style={{ fontSize: 60 }}>{currentSource.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 8 }}>{currentSource.name}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{currentSource.note}</span>
                  </>
                )}
                {customSourceImg && (
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setCustomSourceImg(null)}
                    style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)' }}
                  >
                    ✕ Quitar
                  </button>
                )}
              </div>

              {/* Source Presets */}
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                O prueba con estos rostros de muestra:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {SOURCE_FACES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSource(s.id); setCustomSourceImg(null); setResultReady(false); }}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: selectedSource === s.id && !customSourceImg ? '2px solid var(--accent-pink)' : '1px solid var(--border-subtle)',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 600
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{s.emoji}</span>
                    <span>{s.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Bar & Generate Button */}
          <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={enhanceFace}
                  onChange={e => setEnhanceFace(e.target.checked)}
                />
                <span>✨ Restauración Facial Ultra HD (GFP-GAN)</span>
              </label>
              <span className="badge badge-accent">1 Crédito</span>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleStartSwap}
              disabled={isProcessing}
              style={{
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4)',
                minWidth: 220
              }}
            >
              {isProcessing ? 'Procesando Swap...' : '⚡ Intercambiar Rostro'}
            </button>
          </div>

          {/* Progress State */}
          {isProcessing && (
            <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>
                <span>{statusMsg}</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Result Section */}
          {resultReady && (
            <div className="card" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, textAlign: 'left' }}>
                    🎉 ¡Intercambio Facial Exitoso!
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'left' }}>
                    Compara el resultado o descárgalo para usarlo en tus videos.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      alert('Descargando imagen HD con Face Swap aplicado...');
                    }}
                  >
                    ⬇️ Descargar Imagen HD
                  </button>
                  <Link href="/studio" className="btn btn-primary btn-sm">
                    🎬 Animar en Studio 9:16 →
                  </Link>
                </div>
              </div>

              {/* Before / After Comparison */}
              <div style={{
                position: 'relative',
                maxWidth: 600,
                height: 380,
                margin: '0 auto',
                borderRadius: 20,
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: customTargetImg ? `url(${customTargetImg}) center/cover` : currentTarget.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 80 }}>{currentSource.emoji}</span>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                      Rostro Fusionado: {currentSource.name} en {currentTarget.title}
                    </p>
                    <span className="badge badge-accent" style={{ marginTop: 8 }}>
                      Fusión 99.4% Similitud
                    </span>
                  </div>
                </div>

                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: 8,
                  fontSize: 11, fontWeight: 800, color: '#10b981'
                }}>
                  RESULTADO HD
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModal.open}
        defaultTab={authModal.tab}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
      />
    </>
  );
}
