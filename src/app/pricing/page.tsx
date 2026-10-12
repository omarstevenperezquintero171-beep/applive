'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { createClient } from '@/lib/supabase/client';
import type { Profile, PricingPlan, CreditPack } from '@/types';

const PLANS: PricingPlan[] = [
  {
    id: 'plan_free',
    name: 'Prueba Gratuita',
    description: 'Para probar la generación de avatares sin costo.',
    price: 0,
    billingPeriod: 'monthly',
    credits: 3,
    features: [
      '3 videos verticales 9:16 de prueba',
      'Avatares estándar prediseñados',
      'Resolución HD 720p',
      'Subtítulos automáticos',
      'Marca de agua discreta',
    ],
    tier: 'starter',
    buttonText: 'Comenzar Gratis',
  },
  {
    id: 'plan_creator',
    name: 'Creador TikTok & Reels',
    description: 'Ideal para influencers y creadores de contenido frecuente.',
    price: 19,
    billingPeriod: 'monthly',
    credits: 50,
    features: [
      '50 videos verticales 9:16 al mes',
      'Subida de fotos propias para avatar',
      'Sin marca de agua',
      'Resolución Full HD 1080p',
      'Voces naturales en español (varios acentos)',
      'Subtítulos animados estilo TikTok',
      'Fondos personalizados e imágenes B-roll',
    ],
    popular: true,
    tier: 'pro',
    buttonText: 'Elegir Plan Creador',
  },
  {
    id: 'plan_agency',
    name: 'Pro Studio & Agencia',
    description: 'Para agencias, empresas y creadores profesionales.',
    price: 49,
    billingPeriod: 'monthly',
    credits: 200,
    features: [
      '200 videos verticales 9:16 al mes',
      'Avatares interactivos en streaming en vivo',
      'Clonación de voz con ElevenLabs',
      'Generación prioritaria ultrarrápida',
      'Resolución 4K ultra nítida',
      'Acceso a API externa para automatización',
      'Soporte VIP prioritario',
    ],
    tier: 'unlimited',
    buttonText: 'Elegir Plan Pro Studio',
  },
];

const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'pack_15',
    name: 'Pack Inicial',
    credits: 15,
    price: 4.99,
    pricePerCredit: '$0.33 / video',
  },
  {
    id: 'pack_50',
    name: 'Pack Creador',
    credits: 50,
    price: 14.99,
    pricePerCredit: '$0.29 / video',
    badge: 'Más Vendido',
  },
  {
    id: 'pack_150',
    name: 'Pack Masivo',
    credits: 150,
    price: 34.99,
    pricePerCredit: '$0.23 / video',
    badge: 'Mejor Ahorro',
  },
];

export default function PricingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutItem, setCheckoutItem] = useState<{
    type: 'plan' | 'pack';
    id: string;
    name: string;
    price: number;
    credits: number;
  } | null>(null);

  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'mercadopago'>('stripe');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({ open: false, tab: 'login' });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

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

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.price === 0) {
      if (!profile) {
        setAuthModal({ open: true, tab: 'register' });
      } else {
        showToast('Ya tienes activa tu cuenta gratuita.', 'success');
      }
      return;
    }

    const calculatedPrice = billingPeriod === 'yearly'
      ? Math.round(plan.price * 0.8 * 12)
      : plan.price;

    setCheckoutItem({
      type: 'plan',
      id: plan.id,
      name: `${plan.name} (${billingPeriod === 'yearly' ? 'Anual -20%' : 'Mensual'})`,
      price: calculatedPrice,
      credits: billingPeriod === 'yearly' ? plan.credits * 12 : plan.credits,
    });
  };

  const handleSelectPack = (pack: CreditPack) => {
    setCheckoutItem({
      type: 'pack',
      id: pack.id,
      name: pack.name,
      price: pack.price,
      credits: pack.credits,
    });
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'CREADOR20' || couponCode.toUpperCase() === 'AVATARAI') {
      setCouponApplied(true);
      showToast('¡Cupón del 20% de descuento aplicado! 🎉', 'success');
    } else {
      showToast('Cupón inválido o expirado.', 'error');
    }
  };

  const handleProcessPayment = async () => {
    if (!profile) {
      setAuthModal({ open: true, tab: 'register' });
      return;
    }

    if (!checkoutItem) return;

    setIsProcessingCheckout(true);

    try {
      const discountedPrice = couponApplied ? checkoutItem.price * 0.8 : checkoutItem.price;

      // Call API Checkout endpoint
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          itemId: checkoutItem.id,
          itemName: checkoutItem.name,
          itemType: checkoutItem.type,
          amount: discountedPrice,
          creditsToAdd: checkoutItem.credits,
          provider: paymentProvider,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update local profile state
        setProfile(prev => prev ? {
          ...prev,
          credits_remaining: prev.credits_remaining + checkoutItem.credits
        } : null);

        setCheckoutSuccess(true);
        showToast(`¡Pago exitoso! Se han añadido ${checkoutItem.credits} créditos a tu cuenta. 🚀`, 'success');
      } else {
        throw new Error(result.error || 'Error al procesar el pago');
      }
    } catch {
      showToast('No se pudo completar el pago. Intenta de nuevo.', 'error');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const finalPrice = checkoutItem
    ? couponApplied
      ? (checkoutItem.price * 0.8).toFixed(2)
      : checkoutItem.price.toFixed(2)
    : '0.00';

  return (
    <>
      <Navbar onOpenAuth={(tab) => setAuthModal({ open: true, tab })} />

      <main className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 14px', borderRadius: 20,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            marginBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--primary-light)'
          }}>
            <span>💎</span> Planes Flexibles & Paquetes de Créditos
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 900, marginBottom: 12 }}>
            Monetiza y Escala tus Videos con <span className="text-gradient">IA Hyperrealista</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
            Elige una suscripción mensual con descuento o adquiere paquetes de créditos según tu ritmo de producción. Sin contratos forzosos.
          </p>

          {/* Billing Switch */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 24, padding: 6, borderRadius: 30, background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}>
            <button
              className={`btn btn-xs ${billingPeriod === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setBillingPeriod('monthly')}
              style={{ borderRadius: 20, padding: '6px 16px' }}
            >
              Facturación Mensual
            </button>
            <button
              className={`btn btn-xs ${billingPeriod === 'yearly' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setBillingPeriod('yearly')}
              style={{ borderRadius: 20, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>Anual</span>
              <span style={{ fontSize: 10, background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: 10, fontWeight: 800 }}>-20% OFF</span>
            </button>
          </div>
        </div>

        {/* Pricing Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24, marginBottom: 60 }}>
          {PLANS.map(plan => {
            const displayPrice = billingPeriod === 'yearly' && plan.price > 0
              ? Math.round(plan.price * 0.8)
              : plan.price;

            return (
              <div
                key={plan.id}
                className={`card ${plan.popular ? 'card-glow' : ''}`}
                style={{
                  padding: 28, borderRadius: 22, display: 'flex', flexDirection: 'column',
                  position: 'relative',
                  border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border-subtle)'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--gradient-primary)', color: '#fff',
                    padding: '4px 16px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase'
                  }}>
                    Más Popular para Reels
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800 }}>{plan.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4, minHeight: 36 }}>{plan.description}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 40, fontWeight: 900 }}>${displayPrice}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {plan.price === 0 ? 'para siempre' : billingPeriod === 'yearly' ? 'USD / mes (anual)' : 'USD / mes'}
                  </span>
                </div>

                <div style={{
                  padding: '8px 12px', borderRadius: 10, background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)', marginBottom: 20, fontSize: 13, fontWeight: 700, color: 'var(--primary-light)'
                }}>
                  ⚡ {plan.credits} créditos de video {plan.price > 0 ? '/ mes' : ''}
                </div>

                {/* Features list */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleSelectPlan(plan)}
                  style={{ padding: '12px 18px', fontWeight: 700 }}
                >
                  {plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Credit Packs Section */}
        <div style={{ marginTop: 40, borderTop: '1px solid var(--border-subtle)', paddingTop: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800 }}>
              ¿Prefieres pagar sólo lo que usas? <span className="text-gradient">Paquetes de Créditos</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
              Sin suscripciones recurrentes. Compra créditos que nunca vencen y úsalos cuando los necesites.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {CREDIT_PACKS.map(pack => (
              <div
                key={pack.id}
                className="card p-6"
                style={{
                  borderRadius: 18, border: '1px solid var(--border-subtle)',
                  display: 'flex', flexDirection: 'column', position: 'relative'
                }}
              >
                {pack.badge && (
                  <div style={{
                    position: 'absolute', top: -10, right: 20,
                    background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 800,
                    padding: '3px 10px', borderRadius: 12
                  }}>
                    {pack.badge}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700 }}>{pack.name}</h4>
                  <span style={{ fontSize: 24, fontWeight: 900 }}>${pack.price}</span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--primary-light)', fontWeight: 700, marginBottom: 4 }}>
                  ⚡ {pack.credits} Créditos de Video
                </div>

                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>
                  {pack.pricePerCredit} · Validez de por vida
                </p>

                <button
                  className="btn btn-secondary w-full"
                  onClick={() => handleSelectPack(pack)}
                  style={{ marginTop: 'auto' }}
                >
                  🛒 Comprar Pack (${pack.price} USD)
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Modal / Carrito de Compras */}
        {checkoutItem && (
          <div
            className="modal-overlay"
            style={{ zIndex: 1000 }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !isProcessingCheckout) {
                setCheckoutItem(null);
                setCheckoutSuccess(false);
              }
            }}
          >
            <div
              className="card card-glow"
              style={{ maxWidth: 480, width: '92%', padding: 24, borderRadius: 22, position: 'relative' }}
            >
              {!checkoutSuccess ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800 }}>🛒 Carrito de Compras</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        Revisa tu orden y selecciona la pasarela de pago
                      </p>
                    </div>
                    <button
                      onClick={() => setCheckoutItem(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Order Summary Box */}
                  <div style={{
                    padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)', marginBottom: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{checkoutItem.name}</span>
                      <span style={{ fontWeight: 800, fontSize: 16 }}>${checkoutItem.price} USD</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>Créditos a recibir:</span>
                      <strong style={{ color: 'var(--primary-light)' }}>+{checkoutItem.credits} créditos</strong>
                    </div>

                    {couponApplied && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#10b981', marginTop: 6 }}>
                        <span>Cupón CREADOR20 (20% OFF):</span>
                        <span>-${(checkoutItem.price * 0.2).toFixed(2)} USD</span>
                      </div>
                    )}

                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '12px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>Total a pagar:</span>
                      <span style={{ fontWeight: 900, fontSize: 22, color: '#fff' }}>${finalPrice} USD</span>
                    </div>
                  </div>

                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    <input
                      className="input"
                      placeholder="Código de cupón (Ej: CREADOR20)"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      style={{ flex: 1, fontSize: 12 }}
                      disabled={couponApplied}
                    />
                    <button
                      type="submit"
                      className="btn btn-secondary btn-sm"
                      disabled={couponApplied || !couponCode.trim()}
                    >
                      {couponApplied ? '✓ Aplicado' : 'Aplicar'}
                    </button>
                  </form>

                  {/* Payment Gateway Selector */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Pasarela de Pago Segura:
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div
                        onClick={() => setPaymentProvider('stripe')}
                        style={{
                          padding: '12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                          border: `2px solid ${paymentProvider === 'stripe' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                          background: paymentProvider === 'stripe' ? 'rgba(99,102,241,0.12)' : 'var(--bg-glass)'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: 14 }}>💳 Stripe</div>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Visa, MC, Amex, Apple Pay</p>
                      </div>

                      <div
                        onClick={() => setPaymentProvider('mercadopago')}
                        style={{
                          padding: '12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                          border: `2px solid ${paymentProvider === 'mercadopago' ? '#009ee3' : 'var(--border-subtle)'}`,
                          background: paymentProvider === 'mercadopago' ? 'rgba(0,158,227,0.12)' : 'var(--bg-glass)'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: 14 }}>🤝 Mercado Pago</div>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Latinoamérica, Pix, Oxxo</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit checkout */}
                  <button
                    className="btn btn-primary btn-lg w-full"
                    onClick={handleProcessPayment}
                    disabled={isProcessingCheckout}
                  >
                    {isProcessingCheckout ? (
                      <><div className="spinner" style={{ width: 20, height: 20 }} /> Procesando con {paymentProvider.toUpperCase()}...</>
                    ) : (
                      `Pagar $${finalPrice} USD con ${paymentProvider === 'stripe' ? 'Stripe' : 'Mercado Pago'}`
                    )}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                    🔒 Conexión encriptada SSL de 256 bits · Cancelación en cualquier momento
                  </p>
                </>
              ) : (
                /* Success Screen */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <span style={{ fontSize: 52, display: 'block', marginBottom: 16 }}>🎉</span>
                  <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>¡Pago Confirmado Exitosamente!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
                    Se han acreditado <strong>+{checkoutItem.credits} créditos</strong> a tu cuenta. Ya puedes generar tus videos verticales en el Studio.
                  </p>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn-primary w-full"
                      onClick={() => {
                        setCheckoutItem(null);
                        setCheckoutSuccess(false);
                      }}
                    >
                      Continuar al Studio AI →
                    </button>
                  </div>
                </div>
              )}
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
      />
    </>
  );
}
