// src/app/studio/[tool]/StudioToolView.tsx
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import CameraCaptureModal from '@/components/CameraCaptureModal';
import { StudioToolConfig } from '@/lib/studioTools';
import { useCreditsGuard } from '@/hooks/useCreditsGuard';

export default function StudioToolView({ config }: { config: StudioToolConfig }) {
  const router = useRouter();
  const { totalCredits, isOutOfCredits, consumeCredit } = useCreditsGuard();

  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({
    open: false,
    tab: 'login',
  });

  // State for form inputs
  const [scriptText, setScriptText] = useState(config.defaultScript || '');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('es-ES-natural');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressPhase, setProgressPhase] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setUploadedFile(ev.target?.result as string);
      showToast('¡Archivo cargado con éxito!');
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteAction = async () => {
    // Check credits guard before running
    const hasCredit = await consumeCredit(() => {
      setAuthModal({ open: true, tab: 'register' });
      showToast('Has agotado tus créditos de prueba gratuita. Regístrate o recarga créditos.');
    });

    if (!hasCredit) return;

    setIsProcessing(true);
    setProgress(15);
    setProgressPhase('Inicializando modelo neuronal de ' + config.title + '...');

    setTimeout(() => {
      setProgress(45);
      setProgressPhase('Procesando parámetros y sincronización vertical 9:16...');
    }, 1200);

    setTimeout(() => {
      setProgress(80);
      setProgressPhase('Aplicando optimizaciones de retención para TikTok & Reels...');
    }, 2400);

    setTimeout(() => {
      setProgress(100);
      setProgressPhase('¡Listo! Video vertical generado exitosamente.');
      setIsProcessing(false);
      setIsCompleted(true);
      showToast('¡Generación completada! 1 crédito descontado.');
    }, 3600);
  };

  return (
    <>
      <Navbar onOpenAuth={tab => setAuthModal({ open: true, tab })} />

      <main style={{ minHeight: 'calc(100vh - 140px)', padding: '24px 0 60px', background: 'var(--bg-base)' }}>
        <div className="container" style={{ maxWidth: 1350 }}>
          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Inicio</Link>
            <span>›</span>
            <Link href="/studio" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Studio</Link>
            <span>›</span>
            <span style={{ color: 'var(--text-secondary)' }}>{config.category}</span>
            <span>›</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{config.title}</span>
          </div>

          {/* Tool Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 32 }}>{config.icon}</span>
                <h1 style={{ fontSize: 26, fontWeight: 900 }}>
                  {config.title}
                </h1>
                <span className="badge badge-accent">{config.badge}</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 680 }}>
                {config.subtitle}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="credits-chip" title="Saldo disponible">
                <span>⚡</span>
                <span>{totalCredits} créditos disponibles</span>
              </div>
              <Link href="/precios" className="btn btn-secondary btn-sm">
                Recargar Créditos
              </Link>
            </div>
          </div>

          {/* MAIN 2-COLUMN STUDIO WORKBENCH */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 460px) 1fr',
            gap: 24,
            alignItems: 'start',
            marginBottom: 36
          }}>
            {/* 1. LEFT CONTROL PANEL (Inputs, Upload, Options) */}
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚙️</span> Panel de Configuración
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Ajusta los parámetros para generar tu contenido
                </p>
              </div>

              {/* Upload or Camera Capture Section */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>
                  Media de Origen (Foto, Rostro o Fondo)
                </label>
                <div style={{
                  padding: 16,
                  borderRadius: 14,
                  border: '2px dashed var(--border-subtle)',
                  background: uploadedFile ? 'rgba(99,102,241,0.05)' : '#090d16',
                  textAlign: 'center'
                }}>
                  {uploadedFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={uploadedFile}
                        alt="Subida"
                        style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }}
                      />
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>Archivo seleccionado</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>Listo para procesar</p>
                      </div>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => setUploadedFile(null)}
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>📁</span>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                        Sube una foto o captura directamente
                      </p>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Subir Archivo
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          onClick={() => setIsCameraModalOpen(true)}
                          style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}
                        >
                          📷 Tomar Foto
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Script / Text Prompt Area */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Guión o Instrucción del Avatar
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {scriptText.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={4}
                  className="input w-full"
                  value={scriptText}
                  onChange={e => setScriptText(e.target.value)}
                  placeholder="Escribe el mensaje o diálogo que dirá el avatar en el video..."
                  style={{ resize: 'none', lineHeight: 1.5 }}
                />
              </div>

              {/* Voice / Accent Selection */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Voz e Idioma
                </label>
                <select
                  className="input w-full"
                  value={selectedVoice}
                  onChange={e => setSelectedVoice(e.target.value)}
                >
                  <option value="es-ES-natural">Carlos · Ejecutivo (Español España)</option>
                  <option value="es-ES-elena">Elena · Directora (Español España)</option>
                  <option value="es-MX-mateo">Mateo · Creador TikTok (Español México)</option>
                  <option value="es-MX-valeria">Valeria · Influencer Reels (Español México)</option>
                  <option value="es-AR-lucas">Lucas · Narrador (Español Argentina)</option>
                  <option value="es-CO-camila">Camila · Storyteller (Español Colombia)</option>
                </select>
              </div>

              {/* Main Action Button */}
              <div style={{ paddingTop: 8 }}>
                <button
                  className="btn btn-primary w-full btn-lg"
                  onClick={handleExecuteAction}
                  disabled={isProcessing}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                    fontSize: 15,
                    fontWeight: 800
                  }}
                >
                  {isProcessing ? 'Renderizando Video...' : `⚡ Generar con ${config.title}`}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Costo: 1 crédito</span>
                  <span>Formato vertical 9:16</span>
                </div>
              </div>
            </div>

            {/* 2. CENTER RESPONSIVE 9:16 PREVIEWER */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: 420,
                height: 640,
                borderRadius: 24,
                overflow: 'hidden',
                background: uploadedFile ? `url(${uploadedFile}) center/cover no-repeat` : 'radial-gradient(circle at 50% 30%, #1e1b4b, #09090b 85%)',
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(99,102,241,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 16
              }}>
                {/* Top Overlay Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    padding: '4px 12px', borderRadius: 20,
                    fontSize: 11, fontWeight: 800, color: '#fff',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <span>{config.icon}</span>
                    <span>9:16 VERTICAL</span>
                  </div>

                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#10b981',
                    background: 'rgba(16,185,129,0.15)', padding: '3px 8px', borderRadius: 12
                  }}>
                    FULL HD 1080p
                  </span>
                </div>

                {/* Center Content Placeholder or Active Animation */}
                <div style={{ textAlign: 'center', padding: 20 }}>
                  {!isProcessing && !isCompleted && (
                    <div style={{
                      width: 110, height: 110, margin: '0 auto 16px',
                      borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 48, boxShadow: '0 10px 30px rgba(99,102,241,0.5)'
                    }}>
                      {config.icon}
                    </div>
                  )}

                  {isProcessing && (
                    <div style={{
                      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
                      padding: 24, borderRadius: 18, border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ fontSize: 36, marginBottom: 12, animation: 'spin 2s infinite' }}>
                        ⚙️
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                        {progressPhase}
                      </p>
                      <div className="progress-bar-track" style={{ marginBottom: 8 }}>
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{progress}% completado</span>
                    </div>
                  )}

                  {isCompleted && (
                    <div style={{
                      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
                      padding: 20, borderRadius: 18, border: '1px solid #10b981'
                    }}>
                      <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🎉</span>
                      <h4 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                        ¡Video 9:16 Generado!
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
                        Tu avatar está sincronizado y listo para descargar.
                      </p>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => showToast('Descargando archivo MP4...')}
                        >
                          ⬇️ Descargar MP4
                        </button>
                        <Link href="/gestor-videos" className="btn btn-secondary btn-xs">
                          Ir al Gestor 📁
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom TikTok/Reels Style Subtitle Overlay */}
                <div style={{
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                  padding: '12px 14px', borderRadius: 14,
                  fontSize: 12, color: '#fff', textAlign: 'center', lineHeight: 1.4
                }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    &ldquo;{scriptText.slice(0, 75)}{scriptText.length > 75 ? '...' : ''}&rdquo;
                  </p>
                  <span style={{ fontSize: 10, color: 'var(--accent-pink)', marginTop: 4, display: 'block' }}>
                    Subtítulos automáticos optimizados para retención
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. BOTTOM SECTION: CONSEJOS DE CREADOR (TIKTOK/REELS RETENTION TIPS) */}
          <div className="card" style={{ padding: 28, background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 24 }}>💡</span>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900 }}>
                  Consejos de Creador para TikTok & Reels
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Estrategias comprobadas para disparar la retención y el alcance con {config.title}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {config.tips.map((tip, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 18,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--gradient-primary)', color: '#fff',
                      fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {idx + 1}
                    </span>
                    <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>{tip.title}</h4>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={photo => {
          setUploadedFile(photo);
          showToast('¡Foto capturada con la cámara correctamente!');
        }}
      />

      {/* Auth Modal for credits / sign-in */}
      <AuthModal
        isOpen={authModal.open}
        defaultTab={authModal.tab}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="toast toast-success" style={{ zIndex: 1200 }}>
          {toastMsg}
        </div>
      )}
    </>
  );
}
