// src/lib/credits.ts
import { createClient } from '@/lib/supabase/client';
import type { Video } from '@/types';

const GUEST_CREDITS_KEY = 'avatarai_guest_credits';
const GUEST_VIDEOS_KEY = 'avatarai_guest_videos';
export const DEFAULT_GUEST_CREDITS = 3;

/**
 * Obtiene los créditos disponibles para invitados desde localStorage.
 */
export function getGuestCredits(): number {
  if (typeof window === 'undefined') return DEFAULT_GUEST_CREDITS;
  const stored = localStorage.getItem(GUEST_CREDITS_KEY);
  if (stored === null) {
    localStorage.setItem(GUEST_CREDITS_KEY, DEFAULT_GUEST_CREDITS.toString());
    return DEFAULT_GUEST_CREDITS;
  }
  const parsed = parseInt(stored, 10);
  return isNaN(parsed) ? DEFAULT_GUEST_CREDITS : parsed;
}

/**
 * Deduce un crédito de invitado y retorna el saldo restante.
 */
export function deductGuestCredit(): number {
  if (typeof window === 'undefined') return DEFAULT_GUEST_CREDITS;
  const current = getGuestCredits();
  const next = Math.max(0, current - 1);
  localStorage.setItem(GUEST_CREDITS_KEY, next.toString());
  return next;
}

/**
 * Obtiene los videos generados en modo invitado desde localStorage.
 */
export function getGuestVideos(): Video[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Guarda un video generado en modo invitado en localStorage.
 */
export function saveGuestVideo(video: Video): void {
  if (typeof window === 'undefined') return;
  const videos = getGuestVideos();
  const updated = [video, ...videos.filter(v => v.id !== video.id)];
  localStorage.setItem(GUEST_VIDEOS_KEY, JSON.stringify(updated));
}

/**
 * Elimina un video de invitado de localStorage.
 */
export function deleteGuestVideo(id: string): void {
  if (typeof window === 'undefined') return;
  const videos = getGuestVideos();
  const updated = videos.filter(v => v.id !== id);
  localStorage.setItem(GUEST_VIDEOS_KEY, JSON.stringify(updated));
}

/**
 * Actualiza el estado de un video de invitado.
 */
export function updateGuestVideoStatus(id: string, status: Video['status'], url?: string): void {
  if (typeof window === 'undefined') return;
  const videos = getGuestVideos();
  const updated = videos.map(v => {
    if (v.id === id) {
      return {
        ...v,
        status,
        ...(url ? { generated_video_url: url } : {})
      };
    }
    return v;
  });
  localStorage.setItem(GUEST_VIDEOS_KEY, JSON.stringify(updated));
}

/**
 * Sincroniza y migra los videos del modo invitado hacia la cuenta de Supabase del usuario.
 */
export async function migrateGuestVideosToSupabase(userId: string): Promise<number> {
  const guestVideos = getGuestVideos();
  if (!guestVideos.length) return 0;

  const supabase = createClient();
  const toInsert = guestVideos.map(v => ({
    user_id: userId,
    title: v.title,
    avatar_url: v.avatar_url,
    background_url: v.background_url,
    script_text: v.script_text,
    generated_video_url: v.generated_video_url,
    status: v.status,
  }));

  const { error } = await supabase.from('videos').insert(toInsert);
  if (!error) {
    localStorage.removeItem(GUEST_VIDEOS_KEY);
    return toInsert.length;
  }
  return 0;
}
