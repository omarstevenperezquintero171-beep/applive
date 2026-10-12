'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

interface Message {
  id: string;
  sender: 'user' | 'avatar';
  text: string;
  timestamp: string;
}

const AGENTS = [
  {
    id: 'agent_sales',
    name: 'Carlos · Closer de Ventas',
    emoji: '👨‍💼',
    role: 'Especialista en conversión y presentación de productos.',
    bg: 'linear-gradient(135deg,#1e3a5f,#2d6a9f)',
    welcome: '¡Hola! Soy tu asistente de ventas de IA. Cuéntame qué producto o servicio deseas presentar hoy y te ayudo a cerrar más clientes.',
  },
  {
    id: 'agent_tutor',
    name: 'Sofía · Mentora & Educadora',
    emoji: '👩‍🏫',
    role: 'Explicaciones claras y dinámicas para cursos o lecciones.',
    bg: 'linear-gradient(135deg,#4a1c6e,#8b44c0)',
    welcome: '¡Bienvenido! Estoy lista para responder preguntas sobre tu temario o enseñarte cualquier concepto paso a paso.',
  },
  {
    id: 'agent_cyber',
    name: 'Neo · Agente Tech & Soporte',
    emoji: '🤖',
    role: 'Resolución técnica de dudas y asesoría de software.',
    bg: 'linear-gradient(135deg,#0a192f,#00ffcc33)',
    welcome: 'Sistemas en línea. Puedo asistirte en arquitectura de código, resolución de dudas técnicas y automatización.',
  },
];

export default function LiveAvatarPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'avatar',
      text: AGENTS[0].welcome,
      timestamp: 'Ahora',
    },
  ]);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({ open: false, tab: 'login' });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.05;

    utterance.onstart = () => setIsAvatarSpeaking(true);
    utterance.onend = () => setIsAvatarSpeaking(false);
    utterance.onerror = () => setIsAvatarSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStartStream = () => {
    setIsStreaming(true);
    showToast('¡Sesión de Avatar Interactivo conectada en directo! 🔴', 'success');
    speakText(selectedAgent.welcome);
  };

  const handleStopStream = () => {
    setIsStreaming(false);
    setIsAvatarSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    showToast('Sesión de streaming finalizada.', 'success');
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText.trim();
    setInputText('');

    // Avatar AI generation and speaking simulation
    setTimeout(() => {
      let reply = `Excelente pregunta sobre "${currentInput}". Con nuestra tecnología de avatar en tiempo real, puedes conectar directamente con tu audiencia y resolver sus inquietudes al instante.`;
      if (currentInput.toLowerCase().includes('precio') || currentInput.toLowerCase().includes('costo')) {
        reply = 'Nuestros planes comienzan desde $9 USD al mes con créditos para crear decenas de videos verticales y acceso a este módulo de streaming en vivo.';
      } else if (currentInput.toLowerCase().includes('hola')) {
        reply = `¡Hola! Qué gusto saludarte. Estoy listo para interactuar contigo en tiempo real.`;
      }

      const avatarReply: Message = {
        id: `reply_${Date.now()}`,
        sender: 'avatar',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, avatarReply]);
      if (isStreaming) {
        speakText(reply);
      }
    }, 900);
  };

  // Mic speech recognition
  const handleToggleMic = () => {
    if (typeof window === 'undefined') return;

    interface SpeechRecognitionEvent {
      results: {
        [index: number]: {
          [index: number]: {
            transcript: string;
          };
        };
      };
    }

    interface SpeechRecognitionInstance {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onstart: () => void;
      onresult: (event: SpeechRecognitionEvent) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
    }

    type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Tu navegador no soporta entrada de voz por micrófono. Escribe en el chat.', 'error');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Escuchando tu voz... habla ahora 🎙️', 'success');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <>
      <Navbar onOpenAuth={(tab) => setAuthModal({ open: true, tab })} />

      <main className="container" style={{ paddingTop: 24, paddingBottom: 64 }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.3)', marginBottom: 8 }}>
              <span style={{ fontSize: 10 }}>🔴</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f472b6' }}>Módulo Live Stream / WebRTC</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>
              Avatar Interactivo en <span className="text-gradient">Tiempo Real</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
              Agente conversacional en streaming con latencia ultrabaja (&lt;300ms) impulsado por D-ID / HeyGen y ElevenLabs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {isStreaming ? (
              <button className="btn btn-secondary" onClick={handleStopStream} style={{ color: '#f87171' }}>
                ⏹ Finalizar Transmisión
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleStartStream}>
                🔴 Iniciar Streaming en Vivo
              </button>
            )}
          </div>
        </div>

        {/* Live Studio Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 24 }}>
          {/* LEFT: Live Video Stream Screen */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stream Canvas Card */}
            <div className="card" style={{
              borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border-medium)',
              background: '#040711', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
            }}>
              {/* Top Stream Overlay */}
              <div style={{
                position: 'absolute', top: 16, left: 16, right: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    padding: '4px 10px', borderRadius: 20,
                    background: isStreaming ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.6)',
                    fontSize: 11, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: isStreaming ? 'inline-block' : 'none' }} />
                    {isStreaming ? 'EN VIVO' : 'EN ESPERA'}
                  </div>
                  <div style={{ padding: '4px 8px', borderRadius: 12, background: 'rgba(0,0,0,0.6)', fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                    FPS: 30 · Latencia: 240ms
                  </div>
                </div>

                <div style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(0,0,0,0.6)', fontSize: 11, color: '#fff' }}>
                  {selectedAgent.name.split('·')[0]}
                </div>
              </div>

              {/* Avatar Streaming Display */}
              <div style={{
                height: 440,
                background: selectedAgent.bg,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
              }}>
                {/* Visual Speaking Ripple */}
                {isAvatarSpeaking && (
                  <div style={{
                    position: 'absolute', width: 220, height: 220, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.4)',
                    animation: 'pulse 1.2s infinite'
                  }} />
                )}

                {/* Avatar Icon / Character */}
                <div style={{
                  width: 140, height: 140, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 70, border: '4px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  transform: isAvatarSpeaking ? 'scale(1.06)' : 'scale(1)',
                  transition: 'transform 0.2s ease', zIndex: 2
                }}>
                  {selectedAgent.emoji}
                </div>

                {/* Status caption */}
                <div style={{ marginTop: 24, zIndex: 2 }}>
                  {isAvatarSpeaking ? (
                    <div style={{
                      padding: '6px 16px', borderRadius: 20,
                      background: 'rgba(99,102,241,0.85)', backdropFilter: 'blur(6px)',
                      color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <span>🎙️</span> Hablando en directo...
                    </div>
                  ) : isStreaming ? (
                    <div style={{
                      padding: '6px 14px', borderRadius: 20,
                      background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)',
                      fontSize: 11, fontWeight: 600
                    }}>
                      👂 Escuchando tu mensaje...
                    </div>
                  ) : (
                    <div style={{
                      padding: '6px 14px', borderRadius: 20,
                      background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.6)',
                      fontSize: 11
                    }}>
                      Presiona &quot;Iniciar Streaming&quot; para conectar
                    </div>
                  )}
                </div>
              </div>

              {/* Stream bottom controls */}
              <div style={{
                padding: '12px 20px', background: 'rgba(0,0,0,0.85)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  Modo: <strong>Conversación Bidireccional en Vivo</strong>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className={`btn btn-xs ${isListening ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={handleToggleMic}
                    style={{ fontSize: 11 }}
                  >
                    {isListening ? '🔴 Grabando Micrófono' : '🎙️ Hablar por Micrófono'}
                  </button>
                </div>
              </div>
            </div>

            {/* Agent Selector Card */}
            <div className="card p-4">
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Seleccionar Agente Interactivo
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {AGENTS.map(agent => (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent);
                      if (isStreaming) speakText(agent.welcome);
                    }}
                    style={{
                      padding: 12, borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                      border: `1px solid ${selectedAgent.id === agent.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: selectedAgent.id === agent.id ? 'rgba(99,102,241,0.12)' : 'var(--bg-glass)',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: 28, display: 'block', marginBottom: 4 }}>{agent.emoji}</span>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{agent.name.split('·')[0]}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{agent.name.split('·')[1]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Chat Box */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 600, borderRadius: 20 }}>
            {/* Chat Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800 }}>Chat Interactivo</h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>El avatar responderá en video y voz</p>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {profile ? `⚡ ${profile.credits_remaining} créditos` : 'Modo Prueba'}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    padding: '10px 14px', borderRadius: 14,
                    background: msg.sender === 'user' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.06)',
                    color: '#fff', fontSize: 13, lineHeight: 1.5,
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    {msg.sender === 'avatar' ? selectedAgent.name.split('·')[0] : 'Tú'} · {msg.timestamp}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} style={{ padding: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder={isStreaming ? 'Escribe lo que quieres que responda...' : 'Inicia el streaming para chatear...'}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                style={{ flex: 1 }}
              />

              <button
                type="button"
                className={`btn btn-secondary ${isListening ? 'btn-primary' : ''}`}
                onClick={handleToggleMic}
                title="Hablar por micrófono"
              >
                🎙️
              </button>

              <button type="submit" className="btn btn-primary" disabled={!inputText.trim()}>
                Enviar
              </button>
            </form>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.msg}
          </div>
        )}
      </main>

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal(prev => ({ ...prev, open: false }))}
        defaultTab={authModal.tab}
      />
    </>
  );
}
