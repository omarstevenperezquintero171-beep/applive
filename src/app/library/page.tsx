'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { createClient } from '@/lib/supabase/client';
import { getGuestVideos, deleteGuestVideo } from '@/lib/credits';
import type { Video } from '@/types';

export default function LibraryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'processing'>('all');
  const [activeVideoModal, setActiveVideoModal] = useState<Video | null>(null);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({ open: false, tab: 'login' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadVideos = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setVideos(data || []);
    } else {
      // In guest mode, load local videos
      const guestVids = getGuestVideos();
      setVideos(guestVids);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (user) {
        const { data } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (isMounted) setVideos(data || []);
      } else {
        if (isMounted) setVideos(getGuestVideos());
      }
      if (isMounted) setLoading(false);
    }
    init();
    return () => { isMounted = false; };
  }, []);

  const handleDeleteVideo = async (video: Video) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este video?')) return;

    if (video.is_guest) {
      deleteGuestVideo(video.id);
      setVideos(prev => prev.filter(v => v.id !== video.id));
      showToast('Video eliminado del almacenamiento local.', 'success');
    } else {
      const supabase = createClient();
      const { error } = await supabase.from('videos').delete().eq('id', video.id);
      if (!error) {
        setVideos(prev => prev.filter(v => v.id !== video.id));
        showToast('Video eliminado con éxito.', 'success');
      } else {
        showToast('Error al eliminar el video.', 'error');
      }
    }

    if (activeVideoModal?.id === video.id) {
      setActiveVideoModal(null);
    }
  };

  const filteredVideos = videos.filter(v => {
    if (selectedFilter === 'completed') return v.status === 'completed';
    if (selectedFilter === 'processing') return v.status === 'processing' || v.status === 'pending';
    return true;
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('¡Enlace de video copiado al portapapeles! 📋', 'success');
    }
  };

  return (
    <>
      <Navbar onOpenAuth={(tab) => setAuthModal({ open: true, tab })} />

      <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800 }}>
              Biblioteca de <span className="text-gradient">Videos Generados</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
              Tus videos verticales optimizados para TikTok, Reels y Shorts con avatares IA.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/studio" className="btn btn-primary">
              🎬 Nuevo Video en Studio
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 28,
          background: 'var(--bg-glass)', padding: '10px 16px', borderRadius: 14, border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'all', label: `Todos (${videos.length})` },
              { id: 'completed', label: `Listos (${videos.filter(v => v.status === 'completed').length})` },
              { id: 'processing', label: `En Proceso (${videos.filter(v => v.status !== 'completed').length})` },
            ].map(f => (
              <button
                key={f.id}
                className={`btn btn-xs ${selectedFilter === f.id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedFilter(f.id as typeof selectedFilter)}
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Resolución: 1080x1920 (9:16 vertical)
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cargando tus videos...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVideos.length === 0 && (
          <div className="card p-8" style={{ textAlign: 'center', maxWidth: 500, margin: '40px auto' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>📱</span>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {selectedFilter === 'all' ? 'Aún no tienes videos creados' : 'No hay videos en este filtro'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              Crea tu primer video vertical hiperrealista a partir de una foto o un avatar con voz y subtítulos automáticos.
            </p>
            <Link href="/studio" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              ✨ Crear mi primer video en Studio
            </Link>
          </div>
        )}

        {/* Videos Grid 9:16 Cards */}
        {!loading && filteredVideos.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24
          }}>
            {filteredVideos.map(video => (
              <div
                key={video.id}
                className="card"
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--border-subtle)',
                  transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.6)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => setActiveVideoModal(video)}
              >
                {/* 9:16 Aspect ratio container */}
                <div style={{
                  aspectRatio: '9/16',
                  width: '100%',
                  background: video.background_url?.startsWith('linear') || video.background_url?.startsWith('#')
                    ? video.background_url
                    : '#090d16',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {/* Avatar centered */}
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 40, border: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    {video.avatar_url?.length === 2 || video.avatar_url?.length === 4 ? video.avatar_url : '✨'}
                  </div>

                  {/* Play badge */}
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, color: '#fff', border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    ▶
                  </div>

                  {/* Status chip */}
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    padding: '4px 8px', borderRadius: 12,
                    fontSize: 10, fontWeight: 700,
                    background: video.status === 'completed' ? 'rgba(16,185,129,0.85)' : 'rgba(245,158,11,0.85)',
                    color: '#fff'
                  }}>
                    {video.status === 'completed' ? '✓ Listo' : '⚙️ Procesando'}
                  </div>

                  {/* Format badge */}
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    padding: '4px 8px', borderRadius: 12,
                    fontSize: 10, fontWeight: 700,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff'
                  }}>
                    9:16 Vertical
                  </div>

                  {/* Subtitle preview at bottom */}
                  {video.script_text && (
                    <div style={{
                      position: 'absolute', bottom: 12, left: 12, right: 12,
                      background: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '6px 10px',
                      fontSize: 10, color: '#fff', textAlign: 'center',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      &ldquo;{video.script_text}&rdquo;
                    </div>
                  )}
                </div>

                {/* Card metadata */}
                <div style={{ padding: 14 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {video.title || 'Video Vertical 9:16'}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    <span>{video.is_guest ? 'Modo Invitado' : 'Guardado en Nube'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Player & Export Modal (9:16 Vertical Modal) */}
        {activeVideoModal && (
          <div
            className="modal-overlay"
            style={{ zIndex: 1000 }}
            onClick={(e) => e.target === e.currentTarget && setActiveVideoModal(null)}
          >
            <div
              className="card card-glow"
              style={{
                maxWidth: 420, width: '92%', maxHeight: '92vh', overflowY: 'auto',
                padding: 20, borderRadius: 24, position: 'relative'
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setActiveVideoModal(null)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: '#fff', width: 32, height: 32, borderRadius: '50%',
                  cursor: 'pointer', fontSize: 16, zIndex: 10
                }}
              >
                ✕
              </button>

              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, paddingRight: 32 }}>
                {activeVideoModal.title || 'Video Avatar AI (9:16)'}
              </h3>

              {/* 9:16 Video Player Container */}
              <div style={{
                aspectRatio: '9/16',
                width: '100%',
                maxHeight: 460,
                borderRadius: 16,
                background: activeVideoModal.background_url?.startsWith('linear') || activeVideoModal.background_url?.startsWith('#')
                  ? activeVideoModal.background_url
                  : '#0a0f1d',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 16,
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                  <span>HD 1080p</span>
                  <span>9:16 Vertical Reels</span>
                </div>

                {/* Avatar Stage in modal */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 48, border: '3px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.7)'
                  }}>
                    {activeVideoModal.avatar_url?.length === 2 || activeVideoModal.avatar_url?.length === 4
                      ? activeVideoModal.avatar_url
                      : '✨'}
                  </div>

                  {/* Animated TikTok-style captions */}
                  {activeVideoModal.script_text && (
                    <div style={{
                      background: 'rgba(0,0,0,0.75)',
                      backdropFilter: 'blur(6px)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      maxWidth: '95%',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.15)'
                    }}>
                      <p style={{
                        fontSize: 12, fontWeight: 800, color: '#fef08a',
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: 1.4
                      }}>
                        &ldquo;{activeVideoModal.script_text}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom audio player progress */}
                <div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginBottom: 8 }}>
                    <div style={{ width: '100%', height: '100%', background: 'var(--gradient-primary)', borderRadius: 2 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                    <span>0:00</span>
                    <span>0:32</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <a
                  href={activeVideoModal.generated_video_url || '#'}
                  download={`${activeVideoModal.title || 'avatar_reel'}.mp4`}
                  className="btn btn-primary w-full"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => showToast('¡Descarga de video MP4 iniciada! 📥', 'success')}
                >
                  <span>⬇️ Descargar Video Vertical MP4</span>
                </a>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleShare}
                  >
                    🔗 Copiar Enlace
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#f87171' }}
                    onClick={() => handleDeleteVideo(activeVideoModal)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
        onSuccess={loadVideos}
      />
    </>
  );
}
