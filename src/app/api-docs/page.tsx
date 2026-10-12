// src/app/api-docs/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/v1/videos/generate',
    title: 'Generar Video 9:16 con Avatar',
    desc: 'Crea un video vertical con sincronización labial automática a partir de un texto o audio.',
    requestExample: `{
  "avatar_id": "av_exec_m",
  "script": "Descubre cómo escalar tu negocio con avatares de IA.",
  "voice_id": "es-ES-natural",
  "aspect_ratio": "9:16",
  "subtitles": true,
  "webhook_url": "https://tu-servidor.com/webhook"
}`,
    responseExample: `{
  "id": "vid_9f82bc31a4",
  "status": "processing",
  "created_at": "2026-10-12T17:00:00Z",
  "estimated_seconds": 18,
  "credits_deducted": 1
}`
  },
  {
    method: 'POST',
    path: '/api/v1/avatars/live-stream',
    title: 'Iniciar Sesión WebRTC en Directo',
    desc: 'Establece una conexión de streaming bidireccional interactiva con latencia menor a 300ms.',
    requestExample: `{
  "avatar_id": "av_cyber",
  "interactive_mode": "sales_agent",
  "language": "es",
  "client_offer_sdp": "v=0\\no=- 12345 2 IN IP4 127.0.0.1..."
}`,
    responseExample: `{
  "session_id": "stream_live_8842",
  "status": "connected",
  "server_answer_sdp": "v=0\\no=- 67890 2 IN IP4 127.0.0.1...",
  "ice_servers": [{"urls": "turn:turn.mimik.ai:3478"}]
}`
  },
  {
    method: 'POST',
    path: '/api/v1/voices/clone',
    title: 'Clonar Voz de Usuario',
    desc: 'Entrena un perfil de voz sintética a partir de una muestra de audio de 30 segundos.',
    requestExample: `{
  "voice_name": "Carlos Corporativo Pro",
  "audio_sample_url": "https://storage.empresa.com/audio/carlos_sample.wav",
  "language": "es-ES"
}`,
    responseExample: `{
  "voice_id": "voice_cloned_4492",
  "status": "ready",
  "quality_score": 0.96
}`
  },
  {
    method: 'GET',
    path: '/api/v1/videos/{id}',
    title: 'Consultar Estado de Video',
    desc: 'Obtiene el estado de renderizado y el enlace de descarga MP4.',
    requestExample: `// Request Header:
Authorization: Bearer mk_live_abcdef123456`,
    responseExample: `{
  "id": "vid_9f82bc31a4",
  "status": "completed",
  "download_url": "https://cdn.mimik.ai/exports/vid_9f82bc31a4.mp4",
  "duration_seconds": 24,
  "resolution": "1080x1920"
}`
  }
];

export default function ApiDocsPage() {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'python' | 'node'>('curl');
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);

  const ep = ENDPOINTS[selectedEndpoint];

  return (
    <>
      <Navbar />

      <main style={{ minHeight: 'calc(100vh - 140px)', padding: '40px 0 80px', background: 'var(--bg-base)' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              fontSize: 12, fontWeight: 800, padding: '4px 14px', borderRadius: 20,
              background: 'rgba(99,102,241,0.15)', color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1.5
            }}>
              Desarrolladores & Enterprise
            </span>
            <h1 style={{ fontSize: 34, fontWeight: 900, marginTop: 12, marginBottom: 10 }}>
              Documentación de la <span className="text-gradient">API REST de Mimik AI</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto' }}>
              Automatiza la producción de miles de videos verticales 9:16 y streaming de avatares en tiempo real desde tu propio backend.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
            {/* Left Sidebar: Endpoints list */}
            <div className="card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                Endpoints de la API (v1)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ENDPOINTS.map((e, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedEndpoint(idx)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: selectedEndpoint === idx ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                      background: selectedEndpoint === idx ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                        background: e.method === 'POST' ? '#10b981' : '#3b82f6', color: '#fff'
                      }}>
                        {e.method}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{e.title}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {e.path}
                    </span>
                  </button>
                ))}
              </div>

              {/* Authentication Box */}
              <div style={{ marginTop: 24, padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>🔑 Autenticación</h4>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Incluye tu clave API en la cabecera HTTP:
                  <code style={{ display: 'block', marginTop: 4, color: '#a855f7', wordBreak: 'break-all' }}>
                    Authorization: Bearer mk_live_...
                  </code>
                </p>
                <Link href="/precios" className="btn btn-primary btn-xs w-full" style={{ marginTop: 10 }}>
                  Solicitar API Key Pro →
                </Link>
              </div>
            </div>

            {/* Right: Endpoint details & Code samples */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 900, padding: '3px 8px', borderRadius: 6,
                      background: ep.method === 'POST' ? '#10b981' : '#3b82f6', color: '#fff'
                    }}>
                      {ep.method}
                    </span>
                    <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{ep.path}</h2>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
                    {ep.desc}
                  </p>
                </div>

                {/* Code language toggles */}
                <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 8 }}>
                  {(['curl', 'python', 'node'] as const).map(l => (
                    <button
                      key={l}
                      className={`btn btn-xs ${selectedLang === l ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setSelectedLang(l)}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Request Payload */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Cuerpo de la Petición (JSON Request)
                </h3>
                <pre style={{
                  background: '#090d16', padding: 16, borderRadius: 12,
                  border: '1px solid var(--border-subtle)', color: '#38bdf8',
                  fontSize: 13, overflowX: 'auto', margin: 0, fontFamily: 'monospace'
                }}>
                  {ep.requestExample}
                </pre>
              </div>

              {/* Response Payload */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Respuesta Exitosa (200 OK Response)
                </h3>
                <pre style={{
                  background: '#090d16', padding: 16, borderRadius: 12,
                  border: '1px solid var(--border-subtle)', color: '#a7f3d0',
                  fontSize: 13, overflowX: 'auto', margin: 0, fontFamily: 'monospace'
                }}>
                  {ep.responseExample}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
