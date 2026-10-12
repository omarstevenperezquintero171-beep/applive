/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getGuestCredits, deductGuestCredit, saveGuestVideo, updateGuestVideoStatus } from '@/lib/credits';
import type { Profile, Video } from '@/types';

const AVATAR_CATEGORIES = ['Todos', 'Profesional', 'Creativo', 'Tech', '3D & AI'] as const;

const AVATARS = [
  { id: 'av_exec_m', emoji: '👨‍💼', label: 'Carlos · Ejecutivo', category: 'Profesional', bg: 'linear-gradient(135deg,#1e3a5f,#2d6a9f)' },
  { id: 'av_exec_f', emoji: '👩‍💼', label: 'Elena · Directora', category: 'Profesional', bg: 'linear-gradient(135deg,#2e1e5f,#6a2d9f)' },
  { id: 'av_prof_f', emoji: '👩‍🏫', label: 'Sofía · Educadora', category: 'Creativo', bg: 'linear-gradient(135deg,#4a1c6e,#8b44c0)' },
  { id: 'av_crea_f', emoji: '👩‍🎨', label: 'Maya · Creadora', category: 'Creativo', bg: 'linear-gradient(135deg,#5c1a1a,#c0442e)' },
  { id: 'av_dev_m', emoji: '🧑‍💻', label: 'Alex · Tech Lead', category: 'Tech', bg: 'linear-gradient(135deg,#1a3a2e,#2e9e68)' },
  { id: 'av_scie_m', emoji: '🧑‍🔬', label: 'David · Analista', category: 'Tech', bg: 'linear-gradient(135deg,#1a3450,#2e7dc0)' },
  { id: 'av_cyber', emoji: '🤖', label: 'Neo · Cyber AI', category: '3D & AI', bg: 'linear-gradient(135deg,#0a192f,#00ffcc33)' },
  { id: 'av_astro', emoji: '👩‍🚀', label: 'Aria · Futurista', category: '3D & AI', bg: 'linear-gradient(135deg,#1a1a4a,#4a4ac0)' },
];

const BACKGROUNDS = [
  { id: 'bg_dark', label: 'Estudio Dark', color: '#0f172a', preview: '🎥' },
  { id: 'bg_office', label: 'Oficina Glass', color: '#1a2332', preview: '🏢' },
  { id: 'bg_neon', label: 'Cyber Neon', color: 'linear-gradient(180deg,#0f172a,#1e1b4b,#311042)', preview: '🟣' },
  { id: 'bg_sunset', label: 'Atardecer', color: 'linear-gradient(180deg,#431407,#7c2d12,#180b05)', preview: '🌅' },
  { id: 'bg_blue_grad', label: 'Gradiente Pro', color: 'linear-gradient(180deg,#091a28,#0f2d4a,#05101a)', preview: '🔵' },
  { id: 'bg_emerald', label: 'Minimal Green', color: 'linear-gradient(180deg,#062b1e,#041f15)', preview: '🍃' },
];

const VOICES = [
  { id: 'es-ES-natural', label: 'Mateo (España)', flag: '🇪🇸', tone: 'Profesional y claro', lang: 'es-ES' },
  { id: 'es-MX-warm', label: 'Camila (México)', flag: '🇲🇽', tone: 'Cálida y amigable', lang: 'es-MX' },
  { id: 'es-AR-energy', label: 'Lucas (Argentina)', flag: '🇦🇷', tone: 'Dinámico e inspirador', lang: 'es-AR' },
  { id: 'es-CO-friendly', label: 'Valentina (Colombia)', flag: '🇨🇴', tone: 'Natural para Reels', lang: 'es-CO' },
];

const PROMPT_TEMPLATES = [
  {
    title: '🔥 Gancho Viral TikTok',
    text: '¡Detén el scroll! Si estás creando contenido para redes y tardas horas editando, este truco con avatares de Inteligencia Artificial te ahorrará más de 10 horas semanales. Sígueme para más secretos.',
  },
  {
    title: '💼 Pitch de Negocios',
    text: '¿Sabías que el 80% de los clientes prefieren ver un video antes de comprar? Con nuestra solución puedes presentar tus productos automáticamente en Reels sin poner tu rostro ante la cámara.',
  },
  {
    title: '💡 Tip Rápido de Productividad',
    text: 'Aquí tienes un consejo de un minuto que multiplicará tus resultados hoy: automatiza lo repetitivo y enfócate sólo en las decisiones estratégicas de tu negocio.',
  },
  {
    title: '🚀 Lanzamiento de Producto',
    text: '¡Por fin está aquí! Hoy lanzamos oficialmente nuestra nueva plataforma. Pruébala completamente gratis con el enlace de mi perfil.',
  },
];

interface StudioPanelProps {
  profile: Profile | null;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onVideoCreated: () => void;
}

export default function StudioPanel({ profile, onOpenAuth, onVideoCreated }: StudioPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<typeof AVATAR_CATEGORIES[number]>('Todos');
  const [selectedAvatar, setSelectedAvatar] = useState('av_exec_m');
  const [selectedBg, setSelectedBg] = useState('bg_dark');
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('es-ES-natural');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1'>('9:16');
  const [script, setScript] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationPhase, setGenerationPhase] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [guestCredits, setGuestCredits] = useState<number>(() => getGuestCredits());
  const [lastCreatedVideoId, setLastCreatedVideoId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  const currentAvatar = AVATARS.find(a => a.id === selectedAvatar) || AVATARS[0];
  const currentBg = BACKGROUNDS.find(b => b.id === selectedBg) || BACKGROUNDS[0];
  const currentVoice = VOICES.find(v => v.id === selectedVoice) || VOICES[0];

  const filteredAvatars = selectedCategory === 'Todos'
    ? AVATARS
    : AVATARS.filter(a => a.category === selectedCategory);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('La foto debe pesar menos de 8MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedPhoto(ev.target?.result as string);
      showToast('¡Foto cargada exitosamente!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomBgImage(ev.target?.result as string);
      showToast('¡Fondo personalizado cargado!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Web Speech API for previewing script voice
  const handlePlayVoicePreview = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Síntesis de voz no disponible en este navegador.', 'error');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = script.trim() || 'Hola, soy tu avatar de inteligencia artificial para TikTok y Reels.';
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = currentVoice.lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const simulateRendering = (onDone: () => void) => {
    setTimeout(() => {
      setGenerationProgress(35);
      setGenerationPhase('Generando pista de audio hiperrealista...');
    }, 1200);

    setTimeout(() => {
      setGenerationProgress(70);
      setGenerationPhase('Sincronizando labios y renderizando vertical 9:16...');
    }, 2400);

    setTimeout(() => {
      setGenerationProgress(100);
      setGenerationPhase('¡Completado! Listo para exportar.');
      setTimeout(onDone, 600);
    }, 3800);
  };

  const handleGenerate = async () => {
    const activeCredits = profile ? profile.credits_remaining : guestCredits;

    if (activeCredits <= 0) {
      if (!profile) {
        showToast('Has usado tus 3 videos de prueba. Regístrate o suscríbete para continuar.', 'error');
        onOpenAuth('register');
      } else {
        showToast('Sin créditos disponibles. Adquiere un paquete en la sección de Precios.', 'error');
      }
      return;
    }

    if (!script.trim()) {
      showToast('Escribe un guión o selecciona una plantilla de ejemplo.', 'error');
      setStep(2);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationPhase('Iniciando sintetizador neuronal...');

    const videoTitle = title.trim() || `Avatar Reel - ${new Date().toLocaleDateString('es-ES')}`;
    const backgroundValue = customBgImage || currentBg.color;
    const avatarValue = uploadedPhoto || currentAvatar.emoji;

    try {
      if (profile) {
        // Authenticated flow via Supabase
        const supabase = createClient();
        const { data: videoRecord, error } = await supabase
          .from('videos')
          .insert({
            user_id: profile.id,
            title: videoTitle,
            avatar_url: avatarValue,
            background_url: backgroundValue,
            script_text: script,
            status: 'processing',
          })
          .select()
          .single();

        if (error) throw error;

        // Deduct 1 credit from Supabase profile
        await supabase
          .from('profiles')
          .update({ credits_remaining: Math.max(0, profile.credits_remaining - 1) })
          .eq('id', profile.id);

        setLastCreatedVideoId(videoRecord.id);

        simulateRendering(async () => {
          await supabase
            .from('videos')
            .update({
              status: 'completed',
              generated_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-portrait-of-a-woman-smiling-at-the-camera-42174-large.mp4'
            })
            .eq('id', videoRecord.id);

          onVideoCreated();
          setIsGenerating(false);
          showToast('¡Video vertical 9:16 generado con éxito! 🎉', 'success');
        });
      } else {
        // Guest mode flow with localStorage
        const newGuestCredit = deductGuestCredit();
        setGuestCredits(newGuestCredit);

        const guestVideoId = `guest_${Math.random().toString(36).substring(2, 10)}`;
        const guestVideo: Video = {
          id: guestVideoId,
          user_id: 'guest',
          title: videoTitle,
          avatar_url: avatarValue,
          background_url: backgroundValue,
          script_text: script,
          generated_video_url: null,
          status: 'processing',
          created_at: new Date().toISOString(),
          is_guest: true,
        };

        saveGuestVideo(guestVideo);
        setLastCreatedVideoId(guestVideo.id);

        simulateRendering(() => {
          updateGuestVideoStatus(
            guestVideo.id,
            'completed',
            'https://assets.mixkit.co/videos/preview/mixkit-vertical-portrait-of-a-woman-smiling-at-the-camera-42174-large.mp4'
          );
          onVideoCreated();
          setIsGenerating(false);
          showToast(`¡Video generado! Te quedan ${newGuestCredit} de prueba gratuita 🎁`, 'success');
        });
      }
    } catch {
      setIsGenerating(false);
      showToast('Ocurrió un error al procesar la solicitud.', 'error');
    }
  };

  const panelSection = (header: string, badge: string | null, children: React.ReactNode) => (
    <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {header}
        </h3>
        {badge && (
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', fontWeight: 600 }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <>
      <div className="studio-panel">
        {/* Step indicator tabs */}
        <div className="card p-4">
          <div className="steps">
            {[
              { num: 1, label: '1. Avatar' },
              { num: 2, label: '2. Guión & Audio' },
              { num: 3, label: '3. Fondo & Render' },
            ].map((s, i) => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div
                  className={`step${step === s.num ? ' active' : step > s.num ? ' completed' : ''}`}
                  style={{ cursor: 'pointer', flex: 1 }}
                  onClick={() => setStep(s.num)}
                >
                  <div className="step-num">{step > s.num ? '✓' : s.num}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div className="step-line" />}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Avatar selection & custom photo */}
        {step === 1 && panelSection('Selección de Avatar y Rostro', 'Paso 1 de 3', (
          <>
            {/* Custom Photo Upload Card */}
            <div style={{
              padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.02)',
              border: '1px dashed var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: uploadedPhoto ? 'none' : 'rgba(99,102,241,0.1)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  {uploadedPhoto ? (
                    <img src={uploadedPhoto} alt="Upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 20 }}>📸</span>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>
                    {uploadedPhoto ? 'Foto propia seleccionada' : 'Sube tu propia foto'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {uploadedPhoto ? 'El modelo animará tu rostro' : 'Sube una selfie o retrato nítido (PNG o JPG)'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {uploadedPhoto && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setUploadedPhoto(null)}
                    style={{ fontSize: 11 }}
                  >
                    Quitar
                  </button>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedPhoto ? 'Cambiar Foto' : 'Subir Archivo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Category filter pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {AVATAR_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-xs ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 11, padding: '5px 12px' }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Avatar Grid */}
            <div className="avatar-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {filteredAvatars.map(av => {
                const isSelected = !uploadedPhoto && selectedAvatar === av.id;
                return (
                  <div
                    key={av.id}
                    className={`avatar-option${isSelected ? ' selected' : ''}`}
                    onClick={() => {
                      setSelectedAvatar(av.id);
                      setUploadedPhoto(null);
                    }}
                    style={{
                      background: av.bg,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 8,
                      gap: 4
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{av.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
                      {av.label.split('·')[0]}
                    </span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>
                      {av.category}
                    </span>
                  </div>
                );
              })}
            </div>

            <button className="btn btn-primary w-full" onClick={() => setStep(2)}>
              Continuar al Guión y Voz →
            </button>
          </>
        ))}

        {/* STEP 2: Script and Speech */}
        {step === 2 && panelSection('Guión y Síntesis de Voz', 'Paso 2 de 3', (
          <>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Título del Video (Opcional)
              </label>
              <input
                className="input"
                placeholder="Ej. Hack de ventas para TikTok Reels"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Prompt Templates */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Plantillas de Guión Rápido (1 Clic):
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {PROMPT_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setScript(tmpl.text)}
                    style={{
                      textAlign: 'left', padding: '8px 10px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                      fontSize: 11, color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <span style={{ fontWeight: 700, display: 'block', marginBottom: 2 }}>{tmpl.title}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {tmpl.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Texto a Hablar por el Avatar:
                </label>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {script.length} caracteres · ~{Math.max(1, Math.ceil(script.split(/\s+/).filter(Boolean).length / 140))} min
                </span>
              </div>
              <textarea
                className="textarea"
                placeholder="Escribe lo que dirá tu avatar. Puedes probar el audio con el botón de abajo..."
                value={script}
                onChange={e => setScript(e.target.value)}
                style={{ minHeight: 120, fontSize: 13, lineHeight: 1.6 }}
              />
            </div>

            {/* Voice selection */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Voz de IA y Acento:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {VOICES.map(v => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    style={{
                      padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${selectedVoice === v.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: selectedVoice === v.id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                      fontSize: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                      <span>{v.flag}</span>
                      <span>{v.label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{v.tone}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Voice Audio Button */}
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={handlePlayVoicePreview}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <span>{isPlayingAudio ? '⏹ Detener Audio' : '🔊 Escuchar Vista Previa de Audio'}</span>
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ flex: 1 }}>
                ← Volver
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setStep(3)}
                style={{ flex: 2 }}
                disabled={!script.trim()}
              >
                Continuar al Fondo →
              </button>
            </div>
          </>
        ))}

        {/* STEP 3: Background, Aspect Ratio & Render */}
        {step === 3 && panelSection('Fondo, Formato y Renderizado', 'Paso 3 de 3', (
          <>
            {/* Aspect ratio */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Formato de Salida:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div
                  onClick={() => setAspectRatio('9:16')}
                  style={{
                    padding: 10, borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    border: `1px solid ${aspectRatio === '9:16' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    background: aspectRatio === '9:16' ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <span style={{ fontSize: 18 }}>📱</span>
                  <p style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>Vertical (9:16)</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>TikTok, Reels, Shorts</p>
                </div>
                <div
                  onClick={() => setAspectRatio('1:1')}
                  style={{
                    padding: 10, borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    border: `1px solid ${aspectRatio === '1:1' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    background: aspectRatio === '1:1' ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <span style={{ fontSize: 18 }}>⬛</span>
                  <p style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>Cuadrado (1:1)</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Feed de Instagram / FB</p>
                </div>
              </div>
            </div>

            {/* Backgrounds */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Fondo del Video:
                </label>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => bgFileInputRef.current?.click()}
                  style={{ fontSize: 11 }}
                >
                  📁 {customBgImage ? 'Cambiar fondo' : '+ Subir fondo'}
                </button>
                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBgUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {BACKGROUNDS.map(bg => {
                  const isSelected = !customBgImage && selectedBg === bg.id;
                  return (
                    <div
                      key={bg.id}
                      onClick={() => {
                        setSelectedBg(bg.id);
                        setCustomBgImage(null);
                      }}
                      style={{
                        padding: '10px 6px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        background: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{bg.preview}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{bg.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Generation Status Progress when busy */}
            {isGenerating && (
              <div style={{
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 12, padding: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{generationPhase}</span>
                  <span style={{ fontWeight: 800 }}>{generationProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${generationProgress}%` }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  Renderizando modelo neuronal hiperrealista en la nube...
                </p>
              </div>
            )}

            {/* Credit Cost Indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span>⚡ Costo:</span>
                <strong style={{ color: 'var(--primary-light)' }}>1 crédito</strong>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {profile ? (
                  <span>Saldo actual: <strong>{profile.credits_remaining}</strong></span>
                ) : (
                  <span style={{ color: '#fbbf24' }}>🎁 Saldo invitado: <strong>{guestCredits}</strong></span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)} style={{ flex: 1 }}>
                ← Atrás
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={isGenerating || !script.trim()}
                style={{ flex: 2, padding: '12px 18px', fontSize: 14 }}
              >
                {isGenerating ? (
                  <><div className="spinner" style={{ width: 18, height: 18 }} /> Renderizando...</>
                ) : (
                  '🚀 Generar Video Vertical 9:16'
                )}
              </button>
            </div>

            {lastCreatedVideoId && !isGenerating && (
              <Link href="/library" className="btn btn-secondary w-full" style={{ textAlign: 'center', textDecoration: 'none' }}>
                📁 Ver mis videos en la Biblioteca →
              </Link>
            )}
          </>
        ))}
      </div>

      {/* RIGHT: Mobile 9:16 Preview Screen */}
      <div className="studio-preview">
        <div style={{ textAlign: 'center', width: '100%', maxWidth: 320, margin: '0 auto' }}>
          <div
            className="preview-phone"
            style={{
              background: customBgImage
                ? `url(${customBgImage}) center/cover no-repeat`
                : currentBg.color,
              aspectRatio: aspectRatio === '9:16' ? '9/16' : '1/1',
              minHeight: aspectRatio === '9:16' ? 520 : 320,
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 20px rgba(99,102,241,0.2)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '2px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* Phone Top Notch / Status bar */}
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.6)', zIndex: 2 }}>
              <span>9:41</span>
              <div style={{ width: 60, height: 14, borderRadius: 10, background: 'rgba(0,0,0,0.6)' }} />
              <span>100% 🔋</span>
            </div>

            {/* Avatar Speaking Stage */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', zIndex: 2 }}>
              {/* Avatar circle with talking ripple effect */}
              <div style={{ position: 'relative' }}>
                {isPlayingAudio && (
                  <div style={{
                    position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
                    borderRadius: '50%', border: '2px solid var(--primary)',
                    animation: 'pulse 1s infinite alternate'
                  }} />
                )}

                {uploadedPhoto ? (
                  <div style={{
                    width: 110, height: 110, borderRadius: '50%', overflow: 'hidden',
                    border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                    transform: isPlayingAudio ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }}>
                    <img src={uploadedPhoto} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: currentAvatar.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 46, border: '3px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
                    transform: isPlayingAudio ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }}>
                    {currentAvatar.emoji}
                  </div>
                )}
              </div>

              {/* Talking status indicator */}
              {isPlayingAudio && (
                <div style={{
                  marginTop: 10, padding: '3px 10px', borderRadius: 20,
                  background: 'rgba(99,102,241,0.7)', fontSize: 10, fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <span>🎙️</span> Hablando...
                </div>
              )}

              {/* Subtitles Overlay */}
              <div style={{
                marginTop: 20, maxWidth: '90%',
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                borderRadius: 12, padding: '10px 14px', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>
                  {script ? (
                    <span>&ldquo;{script.substring(0, 95)}{script.length > 95 ? '...' : ''}&rdquo;</span>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Escribe un guión para ver los subtítulos aquí...</span>
                  )}
                </p>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div style={{ padding: '14px 18px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                <span>0:00</span>
                <span>{aspectRatio} · {currentVoice.flag}</span>
                <span>0:30</span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, height: 4, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ width: isPlayingAudio ? '65%' : isGenerating ? `${generationProgress}%` : '0%', height: '100%', background: 'var(--gradient-primary)', transition: 'width 0.3s' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', fontSize: 20, color: '#fff' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                    setIsPlayingAudio(false);
                  }}
                >
                  ⏮
                </button>
                <button
                  type="button"
                  onClick={handlePlayVoicePreview}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--gradient-primary)', border: 'none',
                    color: '#fff', fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(99,102,241,0.5)'
                  }}
                >
                  {isPlayingAudio ? '⏸' : '▶'}
                </button>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}
                  onClick={handlePlayVoicePreview}
                >
                  ⏭
                </button>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
            Vista previa interactiva ({aspectRatio} para Reels y TikTok)
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
