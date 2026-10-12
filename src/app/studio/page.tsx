'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StudioPanel from '@/components/StudioPanel';
import AuthModal from '@/components/AuthModal';
import { createClient } from '@/lib/supabase/client';
import { getGuestCredits, getGuestVideos } from '@/lib/credits';
import type { Profile, Video } from '@/types';

export default function StudioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [guestCredits, setGuestCredits] = useState<number>(3);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({ open: false, tab: 'register' });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchUserData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      setRecentVideos(videos || []);
    } else {
      setProfile(null);
      setGuestCredits(getGuestCredits());
      setRecentVideos(getGuestVideos().slice(0, 3));
    }
    setLoadingProfile(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (isMounted) setProfile(data);
        const { data: videos } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        if (isMounted) setRecentVideos(videos || []);
      } else {
        if (isMounted) {
          setProfile(null);
          setGuestCredits(getGuestCredits());
          setRecentVideos(getGuestVideos().slice(0, 3));
        }
      }
      if (isMounted) setLoadingProfile(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      init();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const statusColor = (status: string) => ({
    pending: 'var(--accent-amber)',
    processing: 'var(--primary)',
    completed: 'var(--accent-green)',
    failed: 'var(--accent-red)',
  }[status] || 'var(--text-muted)');

  const statusLabel = (status: string) => ({
    pending: '🕐 En cola',
    processing: '⚙️ Procesando',
    completed: '✅ Listo',
    failed: '❌ Error',
  }[status] || status);

  return (
    <>
      <Navbar onOpenAuth={(tab) => setAuthModal({ open: true, tab })} />

      <div className="container" style={{ paddingTop: 8, paddingBottom: 24 }}>
        {/* Clean Studio Workspace Header */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
              Studio <span className="text-gradient">9:16</span>
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Creación de videos verticales con avatares de IA para TikTok, Instagram Reels y YouTube Shorts
            </p>
          </div>
          <Link href="/precios" className="btn btn-secondary btn-xs" style={{ borderRadius: 8 }}>
            Planes & Créditos →
          </Link>
        </div>

        <div className="studio-layout">
          {/* LEFT: Controls & Preview */}
          <div>
            <StudioPanel
              profile={profile}
              onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
              onVideoCreated={fetchUserData}
            />
          </div>

          {/* RIGHT: Recent Videos & Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Credits Card */}
            <div className="card p-4">
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                {profile ? 'Mis Créditos' : 'Créditos de Prueba'}
              </h4>
              <div style={{ fontSize: 38, fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                {profile ? profile.credits_remaining : guestCredits}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, marginTop: 4 }}>
                {profile ? 'créditos en tu cuenta' : 'generaciones gratuitas restantes'}
              </p>
              <div className="progress-bar" style={{ marginBottom: 12 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(100, ((profile ? profile.credits_remaining : guestCredits) / (profile ? 20 : 3)) * 100)}%` }}
                />
              </div>
              <button
                className="btn btn-secondary btn-sm w-full"
                onClick={() => router.push('/precios')}
              >
                ⚡ Recargar o Suscribirse
              </button>
            </div>

            {/* Live Interactive Link */}
            <div className="card p-4" style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
              border: '1px solid rgba(168,85,247,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>🔴</span>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Avatar Interactivo en Vivo
                </h4>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Habla con tu avatar en tiempo real por streaming y micrófono.
              </p>
              <button
                className="btn btn-primary btn-sm w-full"
                onClick={() => router.push('/live')}
              >
                Iniciar Streaming en Directo →
              </button>
            </div>

            {/* Recent Videos */}
            <div className="card p-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Recientes ({recentVideos.length})
                </h4>
                <button className="btn btn-ghost btn-sm" onClick={() => router.push('/library')} style={{ fontSize: 11 }}>
                  Ver todos →
                </button>
              </div>

              {recentVideos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  <p style={{ fontSize: 24, marginBottom: 4 }}>🎬</p>
                  <p>Tus videos generados aparecerán aquí</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentVideos.map(v => (
                    <div
                      key={v.id}
                      onClick={() => router.push('/library')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: 'var(--bg-glass)', borderRadius: 10, border: '1px solid var(--border-subtle)',
                        cursor: 'pointer', transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      <div style={{
                        width: 36, height: 60, borderRadius: 6,
                        background: v.background_url?.startsWith('linear') || v.background_url?.startsWith('#') ? v.background_url : '#111827',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0, border: '1px solid var(--border-subtle)'
                      }}>
                        {v.avatar_url?.length === 2 || v.avatar_url?.length === 4 ? v.avatar_url : '🎬'}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v.title || 'Video Vertical 9:16'}
                        </p>
                        <p style={{ fontSize: 11, color: statusColor(v.status), marginTop: 2 }}>
                          {statusLabel(v.status)}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(v.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="card p-4" style={{ background: 'rgba(99,102,241,0.06)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', marginBottom: 10 }}>
                💡 Consejos de Creador
              </h4>
              {[
                'Los primeros 3 segundos definen el 85% de la retención en TikTok.',
                'Agrega subtítulos llamativos de alto contraste para personas sin audio.',
                'Los videos en formato 9:16 tienen 4x más engagement que formatos horizontales.',
              ].map((tip, i) => (
                <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, paddingLeft: 10, borderLeft: '2px solid var(--border-glow-blue)' }}>
                  {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal(prev => ({ ...prev, open: false }))}
        defaultTab={authModal.tab}
        onSuccess={fetchUserData}
      />
    </>
  );
}
