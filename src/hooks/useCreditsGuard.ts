// src/hooks/useCreditsGuard.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getGuestCredits, deductGuestCredit } from '@/lib/credits';
import type { Profile } from '@/types';

export function useCreditsGuard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guestCredits, setGuestCredits] = useState<number>(() => getGuestCredits());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && isMounted) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (isMounted) setProfile(data);
      }
      if (isMounted) {
        setGuestCredits(getGuestCredits());
        setLoading(false);
      }
    }

    checkAuth();

    const handleStorage = () => {
      if (isMounted) setGuestCredits(getGuestCredits());
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const totalCredits = profile ? profile.credits_remaining : guestCredits;
  const isOutOfCredits = totalCredits <= 0;

  /**
   * Verifies credit balance before performing an action.
   * Returns true if credits are available and consumes 1 credit.
   * If depleted, triggers callback or redirects to /precios.
   */
  const consumeCredit = useCallback(async (
    onDepleted?: () => void
  ): Promise<boolean> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Authenticated flow
      const { data: currentProf } = await supabase
        .from('profiles')
        .select('credits_remaining')
        .eq('id', user.id)
        .single();

      if (!currentProf || currentProf.credits_remaining <= 0) {
        if (onDepleted) {
          onDepleted();
        } else {
          router.push('/precios?error=credits_exhausted');
        }
        return false;
      }

      // Deduct 1 credit
      await supabase
        .from('profiles')
        .update({ credits_remaining: currentProf.credits_remaining - 1 })
        .eq('id', user.id);

      setProfile(prev => prev ? { ...prev, credits_remaining: prev.credits_remaining - 1 } : null);
      return true;
    } else {
      // Guest flow
      const current = getGuestCredits();
      if (current <= 0) {
        if (onDepleted) {
          onDepleted();
        } else {
          router.push('/precios?error=trial_exhausted');
        }
        return false;
      }

      deductGuestCredit();
      setGuestCredits(getGuestCredits());
      return true;
    }
  }, [router]);

  return {
    profile,
    guestCredits,
    totalCredits,
    isOutOfCredits,
    consumeCredit,
    loading,
  };
}
