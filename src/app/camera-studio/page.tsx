// src/app/camera-studio/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

// Virtual backgrounds
const VIRTUAL_BACKGROUNDS = [
  { id: 'none', label: 'Cámara Real', icon: '📷', gradient: 'transparent' },
  { id: 'cyber', label: 'Cyberpunk Neon', icon: '🌆', gradient: 'radial-gradient(circle at 50% 30%, #3b0764, #09090b 80%)' },
  { id: 'office', label: 'Oficina Penthouse', icon: '🏢', gradient: 'radial-gradient(circle at 60% 40%, #1e293b, #0f172a 90%)' },
  { id: 'studio', label: 'Estudio Dark LED', icon: '🎙️', gradient: 'radial-gradient(circle at 50% 50%, #1e1b4b, #030712 85%)' },
  { id: 'sunset', label: 'Atardecer Dorado', icon: '🌅', gradient: 'radial-gradient(circle at 50% 70%, #7c2d12, #1c1917 85%)' },
  { id: 'green', label: 'Croma Verde', icon: '🟩', gradient: '#10b981' },
];

// AR Face Filters / Avatar overlays
const FACE_FILTERS = [
  { id: 'none', label: 'Sin Filtro', icon: '⚪' },
  { id: 'cyborg', label: 'Cyborg AI', icon: '🤖', badge: 'HUD Neon' },
  { id: 'glasses', label: 'Lentes Cyber', icon: '🕶️', badge: 'Gafas Retro' },
  { id: 'crown', label: 'Corona VIP', icon: '👑', badge: 'Oro Real' },
  { id: 'streamer', label: 'Audífonos Gamer', icon: '🎧', badge: 'Creator Pro' },
  { id: 'sparkles', label: 'Aura Mágica', icon: '✨', badge: 'Glow FX' },
];

// Preset scripts for teleprompter
const PROMPTER_SCRIPTS = [
  {
    title: 'Gancho Viral TikTok',
    text: '¡Espera! No hagas scroll. Te voy a revelar el secreto que los creadores de contenido no quieren que sepas para conseguir 100k visitas con avatares de IA en menos de 30 días.'
  },
  {
    title: 'Pitch de Ventas Rápido',
    text: '¿Cansado de perder horas grabando videos para tu negocio? Con Mimik AI puedes automatizar toda tu producción de contenido en formato 9:16 sin mostrar tu rostro todos los días.'
  },
  {
    title: 'Bienvenida Streaming en Vivo',
    text: '¡Hola a todos los que se van uniendo al live! Bienvenidos a esta sesión en directo. Dejen sus preguntas en el chat y toquen la pantalla dos veces para enviar corazones.'
  }
];

export default function CameraStudioPage() {
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({
    open: false,
    tab: 'login',
  });

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState('studio');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [isMirrored, setIsMirrored] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  // Teleprompter states
  const [showPrompter, setShowPrompter] = useState(true);
  const [prompterText, setPrompterText] = useState(PROMPTER_SCRIPTS[0].text);
  const [isPrompterScrolling, setIsPrompterScrolling] = useState(false);
  const [prompterSpeed, setPrompterSpeed] = useState(1);
  const [prompterFontSize, setPrompterFontSize] = useState(18);

  // Live simulation states (hearts, viewers, comments)
  const [viewersCount, setViewersCount] = useState(1420);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [recentGifts, setRecentGifts] = useState<{ user: string; gift: string }[]>([]);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const prompterBoxRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Start / Stop camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error(err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Acceso a cámara denegado. Permite los permisos en tu navegador.'
          : 'No se detectó cámara disponible o está en uso por otra app.'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    if (isRecording) stopRecording();
  };

  useEffect(() => {
    // Auto-request camera on initial load
    startCamera();
    return () => stopCamera();
  }, []);

  // Recording logic with MediaRecorder
  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    recordedChunksRef.current = [];

    try {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Timer effect while recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Teleprompter autoscroll effect
  useEffect(() => {
    let animId: number;
    if (isPrompterScrolling && prompterBoxRef.current) {
      const scrollStep = () => {
        if (prompterBoxRef.current) {
          prompterBoxRef.current.scrollTop += prompterSpeed * 0.8;
          if (
            prompterBoxRef.current.scrollTop + prompterBoxRef.current.clientHeight >=
            prompterBoxRef.current.scrollHeight
          ) {
            setIsPrompterScrolling(false);
            return;
          }
        }
        animId = requestAnimationFrame(scrollStep);
      };
      animId = requestAnimationFrame(scrollStep);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPrompterScrolling, prompterSpeed]);

  // Floating hearts simulation
  const addHeart = () => {
    const id = Date.now() + Math.random();
    const x = Math.floor(Math.random() * 60) + 20;
    setHearts(prev => [...prev.slice(-15), { id, x }]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  };

  // Sound effects generator using Web Audio API
  const playSoundEffect = (type: 'applause' | 'airhorn' | 'ding') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'ding') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'airhorn') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.setValueAtTime(480, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // applause noise burst
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('Audio effect error:', e);
    }
  };

  // Snapshot photo from camera
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 720;
    canvas.height = videoRef.current.videoHeight || 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const link = document.createElement('a');
    link.download = `mimik-snapshot-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const currentBgObj = VIRTUAL_BACKGROUNDS.find(b => b.id === selectedBg);

  return (
    <>
      <Navbar onOpenAuth={tab => setAuthModal({ open: true, tab })} />

      <main style={{ minHeight: 'calc(100vh - 140px)', padding: '24px 0 60px', background: 'var(--bg-base)' }}>
        <div className="container" style={{ maxWidth: 1400 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>📹</span>
                <h1 style={{ fontSize: 26, fontWeight: 900 }}>
                  Cámara & <span className="text-gradient">Editor en Vivo</span>
                </h1>
                <span className="badge badge-accent">WebRTC HD</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                Enciende tu cámara, interactúa en tiempo real con fondos virtuales, avatares, filtros AR, teleprompter y graba para TikTok & Reels.
              </p>
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                className={`btn btn-sm ${isCameraActive ? 'btn-ghost' : 'btn-primary'}`}
                onClick={isCameraActive ? stopCamera : startCamera}
              >
                {isCameraActive ? '🔴 Apagar Cámara' : '🟢 Encender Cámara'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={takeSnapshot} disabled={!isCameraActive}>
                📸 Tomar Captura HD
              </button>
              <Link href="/studio" className="btn btn-primary btn-sm">
                Ir a Studio 9:16 →
              </Link>
            </div>
          </div>

          {/* MAIN 3-COLUMN STUDIO LAYOUT */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr 340px',
            gap: 20,
            alignItems: 'start'
          }}>
            {/* LEFT COLUMN: Controls, Backgrounds & AR Masks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Fondos Virtuales */}
              <div className="card" style={{ padding: 18 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🖼️</span> Fondos Virtuales
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {VIRTUAL_BACKGROUNDS.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => { setSelectedBg(bg.id); setCustomBgImage(null); }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: selectedBg === bg.id && !customBgImage ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{bg.icon}</span>
                      <span>{bg.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Background Upload */}
                <div style={{ marginTop: 12 }}>
                  <button
                    className="btn btn-ghost btn-xs w-full"
                    onClick={() => bgInputRef.current?.click()}
                    style={{ fontSize: 11 }}
                  >
                    📁 {customBgImage ? 'Cambiar Fondo Propio' : 'Subir Fondo Personalizado'}
                  </button>
                  <input
                    ref={bgInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                          setCustomBgImage(ev.target?.result as string);
                          setSelectedBg('custom');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Máscaras & Filtros AR */}
              <div className="card" style={{ padding: 18 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🎭</span> Máscaras & Avatares IA
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {FACE_FILTERS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: selectedFilter === f.id ? '2px solid var(--accent-pink)' : '1px solid var(--border-subtle)',
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
                      <span style={{ fontSize: 20 }}>{f.icon}</span>
                      <span>{f.label}</span>
                      {f.badge && (
                        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{f.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Efectos de Sonido SFX */}
              <div className="card" style={{ padding: 18 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📢</span> Efectos de Sonido en Vivo
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  <button className="btn btn-ghost btn-xs" onClick={() => playSoundEffect('applause')}>
                    👏 Aplausos
                  </button>
                  <button className="btn btn-ghost btn-xs" onClick={() => playSoundEffect('airhorn')}>
                    📢 Bocina
                  </button>
                  <button className="btn btn-ghost btn-xs" onClick={() => playSoundEffect('ding')}>
                    ✨ Ding
                  </button>
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: LIVE CAMERA VIEWPORT */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Aspect Ratio & Settings bar */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', maxWidth: aspectRatio === '9:16' ? 420 : 680, marginBottom: 10
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className={`btn btn-xs ${aspectRatio === '9:16' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setAspectRatio('9:16')}
                  >
                    📱 9:16 Vertical
                  </button>
                  <button
                    className={`btn btn-xs ${aspectRatio === '16:9' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setAspectRatio('16:9')}
                  >
                    🖥️ 16:9 Horizontal
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setIsMirrored(prev => !prev)}
                    title="Espejo horizontal"
                  >
                    🪞 {isMirrored ? 'Modo Espejo' : 'Normal'}
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setShowOverlays(prev => !prev)}
                    title="Alternar HUD"
                  >
                    👁️ {showOverlays ? 'Ocultar HUD' : 'Mostrar HUD'}
                  </button>
                </div>
              </div>

              {/* THE CAMERA MONITOR SCREEN */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: aspectRatio === '9:16' ? 420 : 680,
                  height: aspectRatio === '9:16' ? 620 : 420,
                  borderRadius: 24,
                  overflow: 'hidden',
                  background: customBgImage
                    ? `url(${customBgImage}) center/cover no-repeat`
                    : currentBgObj?.gradient || '#090d16',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(99,102,241,0.2)',
                  border: isRecording ? '3px solid #ef4444' : '2px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Live Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: isMirrored ? 'scaleX(-1)' : 'none',
                    opacity: isCameraActive ? (selectedBg !== 'none' ? 0.92 : 1) : 0,
                    mixBlendMode: selectedBg === 'green' ? 'screen' : 'normal'
                  }}
                />

                {/* If Camera is off / Error */}
                {!isCameraActive && (
                  <div style={{ position: 'absolute', textAlign: 'center', padding: 24, zIndex: 10 }}>
                    <span style={{ fontSize: 50, display: 'block', marginBottom: 12 }}>📷</span>
                    <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                      {cameraError || 'La cámara está apagada'}
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={startCamera}>
                      Encender Cámara
                    </button>
                  </div>
                )}

                {/* AR FACE FILTER OVERLAYS */}
                {isCameraActive && selectedFilter !== 'none' && (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedFilter === 'cyborg' && (
                      <div style={{
                        position: 'absolute', top: '25%',
                        width: 180, height: 180,
                        border: '2px solid #00f0ff',
                        borderRadius: '50%',
                        boxShadow: '0 0 30px #00f0ff, inset 0 0 20px #00f0ff',
                        animation: 'pulse 1.5s infinite',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ color: '#00f0ff', fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>
                          CYBORG AI TARGET LOCK
                        </span>
                      </div>
                    )}
                    {selectedFilter === 'glasses' && (
                      <div style={{ position: 'absolute', top: '35%', fontSize: 70, filter: 'drop-shadow(0 0 10px #ec4899)' }}>
                        🕶️
                      </div>
                    )}
                    {selectedFilter === 'crown' && (
                      <div style={{ position: 'absolute', top: '15%', fontSize: 60, filter: 'drop-shadow(0 0 15px #f59e0b)' }}>
                        👑
                      </div>
                    )}
                    {selectedFilter === 'streamer' && (
                      <div style={{ position: 'absolute', top: '22%', fontSize: 90, filter: 'drop-shadow(0 0 10px #8b5cf6)' }}>
                        🎧
                      </div>
                    )}
                    {selectedFilter === 'sparkles' && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center', fontSize: 40 }}>
                        <span style={{ animation: 'bounce 2s infinite' }}>✨</span>
                        <span style={{ animation: 'bounce 1.5s infinite' }}>⭐</span>
                        <span style={{ animation: 'bounce 2.2s infinite' }}>💫</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TIKTOK / REELS STREAMING HUD OVERLAYS */}
                {showOverlays && (
                  <>
                    {/* Top live badge & viewers */}
                    <div style={{
                      position: 'absolute', top: 16, left: 16, right: 16,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      zIndex: 20
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          background: '#ef4444', color: '#fff',
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                          display: 'flex', alignItems: 'center', gap: 5,
                          boxShadow: '0 2px 10px rgba(239,68,68,0.5)'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1s infinite' }} />
                          LIVE
                        </div>
                        <div style={{
                          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 11, fontWeight: 700, color: '#fff'
                        }}>
                          👁️ {viewersCount.toLocaleString()}
                        </div>
                      </div>

                      {isRecording && (
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.9)', color: '#fff',
                          padding: '4px 12px', borderRadius: 20,
                          fontSize: 12, fontWeight: 800,
                          display: 'flex', alignItems: 'center', gap: 6
                        }}>
                          REC {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:
                          {(recordingSeconds % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>

                    {/* Right side interaction buttons (TikTok style) */}
                    <div style={{
                      position: 'absolute', right: 14, bottom: 90,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                      zIndex: 20
                    }}>
                      <button
                        onClick={addHeart}
                        style={{
                          background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
                          width: 44, height: 44, borderRadius: '50%',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', backdropFilter: 'blur(6px)'
                        }}
                      >
                        <span style={{ fontSize: 20 }}>❤️</span>
                      </button>
                      <button
                        onClick={() => {
                          setRecentGifts(prev => [...prev.slice(-3), { user: 'Fan_' + Math.floor(Math.random() * 999), gift: '🌹 Rosa' }]);
                          playSoundEffect('ding');
                        }}
                        style={{
                          background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
                          width: 44, height: 44, borderRadius: '50%',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', backdropFilter: 'blur(6px)'
                        }}
                      >
                        <span style={{ fontSize: 20 }}>🎁</span>
                      </button>
                      <button
                        onClick={takeSnapshot}
                        style={{
                          background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
                          width: 44, height: 44, borderRadius: '50%',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', backdropFilter: 'blur(6px)'
                        }}
                      >
                        <span style={{ fontSize: 18 }}>📸</span>
                      </button>
                    </div>

                    {/* Floating hearts container */}
                    <div style={{ position: 'absolute', right: 14, bottom: 140, width: 80, height: 260, pointerEvents: 'none', overflow: 'hidden' }}>
                      {hearts.map(h => (
                        <span
                          key={h.id}
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: `${h.x}%`,
                            fontSize: 24,
                            animation: 'floatUp 2s forwards',
                          }}
                        >
                          ❤️
                        </span>
                      ))}
                    </div>

                    {/* Bottom streamer info & music ticker */}
                    <div style={{
                      position: 'absolute', bottom: 16, left: 16, right: 70,
                      zIndex: 20
                    }}>
                      {/* Recent gift alert */}
                      {recentGifts.length > 0 && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: 'linear-gradient(135deg, rgba(236,72,153,0.8), rgba(168,85,247,0.8))',
                          padding: '4px 12px', borderRadius: 20,
                          fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 8
                        }}>
                          ⚡ {recentGifts[recentGifts.length - 1].user} envió {recentGifts[recentGifts.length - 1].gift}!
                        </div>
                      )}

                      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        @tu_canal_oficial <span style={{ color: '#00f0ff' }}>✓</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        Grabando en vivo con Mimik AI Studio #AI #Avatar #Creator
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                        <span>🎵</span>
                        <span>Sonido Original · Mimik Audio Pro</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* RECORDING / CAPTURE MAIN BAR */}
              <div style={{
                marginTop: 18,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: 420
              }}>
                {!isRecording ? (
                  <button
                    className="btn btn-primary w-full"
                    onClick={startRecording}
                    disabled={!isCameraActive}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      padding: '14px 24px',
                      fontSize: 15,
                      fontWeight: 800,
                      borderRadius: 14,
                      boxShadow: '0 4px 20px rgba(239,68,68,0.4)'
                    }}
                  >
                    🔴 Iniciar Grabación de Video
                  </button>
                ) : (
                  <button
                    className="btn btn-primary w-full"
                    onClick={stopRecording}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      padding: '14px 24px',
                      fontSize: 15,
                      fontWeight: 800,
                      borderRadius: 14
                    }}
                  >
                    ⏹️ Detener y Guardar Video
                  </button>
                )}
              </div>

              {/* Recorded Video Preview & Download */}
              {recordedVideoUrl && (
                <div className="card" style={{ marginTop: 20, width: '100%', maxWidth: 420, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>🎬 Video Grabado con Éxito</span>
                    <a
                      href={recordedVideoUrl}
                      download={`mimik-recording-${Date.now()}.webm`}
                      className="btn btn-primary btn-xs"
                    >
                      Descargar Video ⬇️
                    </a>
                  </div>
                  <video src={recordedVideoUrl} controls style={{ width: '100%', borderRadius: 10, maxHeight: 200, background: '#000' }} />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: TELEPROMPTER INTEGRADO & GUIONES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Teleprompter Card */}
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📜</span> Teleprompter en Vivo
                  </h3>
                  <button
                    className={`btn btn-xs ${isPrompterScrolling ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setIsPrompterScrolling(prev => !prev)}
                  >
                    {isPrompterScrolling ? '⏸ Pausa' : '▶ Auto-scroll'}
                  </button>
                </div>

                {/* Speed & Font controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Velocidad:</span>
                    <button
                      className={`btn btn-xs ${prompterSpeed === 0.7 ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setPrompterSpeed(0.7)}
                    >
                      Lenta
                    </button>
                    <button
                      className={`btn btn-xs ${prompterSpeed === 1 ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setPrompterSpeed(1)}
                    >
                      1x
                    </button>
                    <button
                      className={`btn btn-xs ${prompterSpeed === 1.6 ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setPrompterSpeed(1.6)}
                    >
                      Rápida
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button className="btn btn-ghost btn-xs" onClick={() => setPrompterFontSize(s => Math.max(12, s - 2))}>A-</button>
                    <button className="btn btn-ghost btn-xs" onClick={() => setPrompterFontSize(s => Math.min(26, s + 2))}>A+</button>
                  </div>
                </div>

                {/* Scrolling Prompter Window */}
                <div
                  ref={prompterBoxRef}
                  style={{
                    height: 220,
                    overflowY: 'auto',
                    padding: 14,
                    background: '#090d16',
                    borderRadius: 12,
                    border: '1px solid var(--border-subtle)',
                    fontSize: prompterFontSize,
                    lineHeight: 1.6,
                    color: '#f8fafc',
                    fontWeight: 600,
                    scrollBehavior: 'smooth'
                  }}
                >
                  <p style={{ margin: 0 }}>{prompterText}</p>
                </div>

                {/* Preset Script Selector */}
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Plantillas de Guiones Virales:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {PROMPTER_SCRIPTS.map((s, idx) => (
                      <button
                        key={idx}
                        className="btn btn-ghost btn-xs"
                        style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: 11 }}
                        onClick={() => {
                          setPrompterText(s.text);
                          if (prompterBoxRef.current) prompterBoxRef.current.scrollTop = 0;
                        }}
                      >
                        📄 {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Script Editor Toggle */}
                <div style={{ marginTop: 12 }}>
                  <textarea
                    rows={3}
                    className="input w-full"
                    placeholder="O escribe tu propio guión aquí..."
                    style={{ fontSize: 12, resize: 'none' }}
                    onChange={e => setPrompterText(e.target.value)}
                  />
                </div>
              </div>

              {/* Tips for Creators */}
              <div className="card" style={{ padding: 18, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>💡</span> Tips para Creadores 9:16
                </h4>
                <ul style={{ fontSize: 11, color: 'var(--text-secondary)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Mira directamente al lente de la cámara para maximizar la conexión visual.</li>
                  <li>Usa el gancho en los primeros 3 segundos para reducir la tasa de abandono.</li>
                  <li>Guarda tu video y súbelo a TikTok, YouTube Shorts y Reels con subtítulos generados.</li>
                </ul>
              </div>
            </div>
          </div>
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
