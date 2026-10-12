// src/types/index.ts
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  credits_remaining: number;
  plan_tier: 'free' | 'starter' | 'pro' | 'unlimited';
  created_at: string;
  updated_at?: string;
}

export interface Video {
  id: string;
  user_id: string;
  title: string | null;
  avatar_url: string | null;
  background_url: string | null;
  script_text: string | null;
  generated_video_url: string | null;
  voice_id?: string | null;
  aspect_ratio?: '9:16' | '1:1' | '16:9';
  duration_seconds?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  is_guest?: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  credits_added: number;
  payment_status: 'completed' | 'pending' | 'failed' | 'refunded';
  payment_provider: 'stripe' | 'mercadopago';
  provider_tx_id?: string;
  plan_id?: string;
  created_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  credits: number;
  features: string[];
  popular?: boolean;
  tier: 'starter' | 'pro' | 'unlimited';
  buttonText: string;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: string;
  badge?: string;
}

export interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
  category: 'Profesional' | 'Creativo' | 'Tech' | '3D & Anime';
  bg: string;
}

export interface VoiceOption {
  id: string;
  label: string;
  gender: 'female' | 'male';
  flag: string;
  tone: string;
  langCode: string;
}
