// src/app/voice-clone/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

const PRESET_VOICES = [
  { id: 'es_m_carlos', name: 'Carlos · Ejecutivo', accent: 'España', gender: 'Masculino', desc: 'Voz profunda, corporativa y convincente', lang: 'es-ES' },
  { id: 'es_f_elena', name: 'Elena · Directora', accent: 'España', gender: 'Femenino', desc: 'Tono ejecutivo claro y articulado', lang: 'es-ES' },
  { id: 'mx_m_mateo', name: 'Mateo · Creador', accent: 'México', gender: 'Masculino', desc: 'Enérgico, dinámico y natural para TikTok', lang: 'es-MX' },
  { id: 'mx_f_valeria', name: 'Valeria · Influencer', accent: 'México', gender: 'Femenino', desc: 'Fresca, carismática y juvenil', lang: 'es-MX' },
  { id: 'ar_m_lucas', name: 'Lucas · Narrador', accent: 'Argentina', gender: 'Masculino', desc: 'Cálido, profesional y narrativo', lang: 'es-AR' },
  { id: 'co_f_camila', name: 'Camila · Storyteller', accent: 'Colombia', gender: 'Femenino', desc: 'Melódica, empática y atractiva', lang: 'es-CO' },
];

export default function VoiceClonePage() {
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({
    open: false,
    tab: 'login',
  });

  // Cloned voices list
  const [clonedVoices, setClonedVoices] = useState<{ id: string; name: string; date: string }[]>([
    { id: 'clone_demo', name: 'Mi Voz Personal (Clonada)', date: 'Hoy' }
  ]);

  // Voice recording & training states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cloneVoiceName, setCloneVoiceName] = useState('Mi Voz Pro');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState('');

  // TTS Synthesis states
  const [selectedVoiceId, setSelectedVoiceId] = useState('es_m_carlos');
  const [speechText, setSpeechText] = useState(
    'Hola a todos. Esta es una demostración de síntesis de voz con inteligencia artificial y clonación neuronal para creadores de contenido.'
  );
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Microphone recording logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      alert('Por favor permite el acceso al micrófono para grabar tu voz.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Train cloned voice simulation
  const handleTrainVoice = () => {
    if (!recordedAudioUrl) {
      alert('Primero debes grabar o subir una muestra de audio.');
      return;
    }
    setIsTraining(true);
    setTrainingProgress(20);
    setTrainingStatus('Extrayendo formantes y timbre vocal...');

    setTimeout(() => {
      setTrainingProgress(55);
      setTrainingStatus('Entrenando modelo de embeddings neuronales...');
    }, 1200);

    setTimeout(() => {
      setTrainingProgress(85);
      setTrainingStatus('Calibrando respiración y cadencia natural...');
    }, 2400);

    setTimeout(() => {
      setTrainingProgress(100);
      setTrainingStatus('¡Voz clonada exitosamente!');
      setIsTraining(false);
      setClonedVoices(prev => [
        { id: `clone_${Date.now()}`, name: cloneVoiceName || 'Voz Personal', date: 'Reciente' },
        ...prev
      ]);
    }, 3400);
  };

  // Web Speech API / TTS preview
  const handlePlayTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('La síntesis de voz no está soportada en este navegador.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    const selectedVoiceObj = PRESET_VOICES.find(v => v.id === selectedVoiceId);
    utterance.lang = selectedVoiceObj?.lang || 'es-ES';
    utterance.rate = speed;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <Navbar onOpenAuth={tab => setAuthModal({ open: true, tab })} />

      <main style={{ minHeight: 'calc(100vh - 140px)', padding: '32px 0 60px', background: 'var(--bg-base)' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', color: '#10b981', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Neural Voice Cloning Engine
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginTop: 12, marginBottom: 8 }}>
              Clon de Voz & <span className="text-gradient">Texto a Voz (TTS)</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto' }}>
              Clona tu propia voz con 30 segundos de audio o genera locuciones hiperrealistas con voces nativas de España y Latinoamérica.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            {/* LEFT COLUMN: VOICE CLONING STUDIO */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🧬</span> 1. Clonar Tu Propia Voz
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Graba tu voz leyendo un texto o sube un archivo de audio
                  </p>
                </div>
                <span className="badge badge-accent">ElevenLabs Pro</span>
              </div>

              {/* Sample Script to read */}
              <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Lee este texto en voz alta con entonación natural:
                </p>
                <p style={{ fontSize: 13, fontStyle: 'italic', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  &ldquo;La inteligencia artificial generativa está transformando la forma en que contamos historias. Con mi voz clonada, puedo crear cientos de videos en minutos.&rdquo;
                </p>
              </div>

              {/* Audio Recorder Controls */}
              <div style={{
                padding: 20,
                borderRadius: 16,
                background: '#090d16',
                border: isRecording ? '2px solid #ef4444' : '1px solid var(--border-subtle)',
                textAlign: 'center',
                marginBottom: 16
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>
                  {isRecording ? '🎙️' : '🎧'}
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: isRecording ? '#ef4444' : '#fff', marginBottom: 12 }}>
                  {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:
                  {(recordingSeconds % 60).toString().padStart(2, '0')}
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  {!isRecording ? (
                    <button className="btn btn-primary btn-sm" onClick={startRecording}>
                      🔴 Grabar Muestra de Voz
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={stopRecording} style={{ background: '#ef4444' }}>
                      ⏹️ Detener Grabación
                    </button>
                  )}

                  <button className="btn btn-secondary btn-sm" onClick={() => audioInputRef.current?.click()}>
                    📁 Subir Audio
                  </button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setRecordedAudioUrl(URL.createObjectURL(f));
                      }
                    }}
                  />
                </div>
              </div>

              {/* Recorded Audio Preview */}
              {recordedAudioUrl && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Muestra Grabada:
                  </p>
                  <audio src={recordedAudioUrl} controls style={{ width: '100%', height: 36 }} />
                </div>
              )}

              {/* Voice Name Input & Train Button */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="Nombre de la voz (ej: Mi Voz TikTok)"
                  value={cloneVoiceName}
                  onChange={e => setCloneVoiceName(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleTrainVoice}
                  disabled={isTraining || !recordedAudioUrl}
                  style={{ minWidth: 140 }}
                >
                  {isTraining ? 'Entrenando...' : '✨ Entrenar Clon'}
                </button>
              </div>

              {/* Training Progress Bar */}
              {isTraining && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>{trainingStatus}</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${trainingProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Cloned Voices List */}
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Tus Voces Clonadas ({clonedVoices.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {clonedVoices.map(cv => (
                    <div
                      key={cv.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', borderRadius: 10,
                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🧬</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{cv.name}</span>
                      </div>
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => {
                          setSelectedVoiceId(cv.id);
                          alert(`Voz ${cv.name} seleccionada para síntesis.`);
                        }}
                      >
                        Usar en Estudio
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: TEXT TO SPEECH SYNTHESIS */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🎙️</span> 2. Sintetizador de Texto a Voz
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Escribe tu guión y escúchalo con entonación natural
                  </p>
                </div>
                <span className="badge badge-accent">Voces Nativas</span>
              </div>

              {/* Voice Selector Grid */}
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                Selecciona una voz predeterminada:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
                {PRESET_VOICES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoiceId(v.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: selectedVoiceId === v.id ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{v.name.split('·')[0]}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.accent}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v.desc}</span>
                  </button>
                ))}
              </div>

              {/* Text Area */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Guión a sintetizar:</label>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{speechText.length} caracteres</span>
                </div>
                <textarea
                  rows={4}
                  className="input w-full"
                  value={speechText}
                  onChange={e => setSpeechText(e.target.value)}
                  style={{ resize: 'none', lineHeight: 1.5 }}
                />
              </div>

              {/* Voice Sliders (Speed, Pitch) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Velocidad:</span>
                    <span style={{ fontWeight: 700 }}>{speed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.1"
                    value={speed}
                    onChange={e => setSpeed(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tono / Pitch:</span>
                    <span style={{ fontWeight: 700 }}>{pitch}</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.1"
                    value={pitch}
                    onChange={e => setPitch(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Audio Player Bar */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  className="btn btn-primary w-full"
                  onClick={handlePlayTTS}
                  style={{
                    background: isPlaying ? '#ef4444' : 'linear-gradient(135deg, #10b981, #06b6d4)',
                    padding: '12px 20px',
                    fontSize: 14,
                    fontWeight: 800
                  }}
                >
                  {isPlaying ? '⏸ Detener Reproducción' : '▶ Escuchar Voz Sintetizada'}
                </button>
                <Link href="/studio" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                  Llevar al Studio 9:16 →
                </Link>
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
