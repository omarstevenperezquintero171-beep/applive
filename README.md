# 🎬 AvatarAI Studio & Live Avatar Platform (AppLive)

> **Plataforma SaaS de generación de videos verticales hiperrealistas (TikTok, Reels, Shorts) y streaming interactivo de avatares en tiempo real.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 🌟 Características Principales

### 1. ⚡ Studio AI de Creación de Video (Formato 9:16 Vertical)
- **Avatares y Fotos Propias**: Carga de selfies o fotos personales con animación sincrónica, o selección de catálogo categorizado (*Profesional, Creativo, Tech, 3D & AI*).
- **Formatos Optimizados**: Ratio vertical 9:16 pensado para retención de audiencia en TikTok, Instagram Reels, Facebook Reels y YouTube Shorts.
- **Fondos Personalizados y B-Roll**: Editor de fondos sólidos, gradientes cinematográficos y subida de imágenes de fondo personalizadas.
- **Subtítulos Dinámicos**: Subtítulos automáticos de alto impacto estilo creador (TikTok).

### 2. 🎙️ Síntesis de Voz y Audio
- Selección de acentos y tonos en español (España, México, Argentina, Colombia).
- Reproductor de audio con **Web Speech API** en vivo con animación sincronizada de rostro y boca en la vista previa del teléfono móvil.
- Integración arquitectónica para **ElevenLabs** y clonación de voz.

### 3. 🔴 Avatar Interactivo en Vivo / WebRTC Streaming
- Módulo de agente conversacional en streaming en tiempo real con latencia menor a 300ms (arquitectura D-ID / HeyGen Streams).
- Chat bidireccional interactivo por texto o **micrófono** (`SpeechRecognition`).
- Roles personalizables (*Carlos Closer de Ventas*, *Sofía Mentora Educativa*, *Neo Soporte Tech*).

### 4. 🎁 Modo Prueba / Invitado (Free Trial)
- Permite a cualquier usuario generar **hasta 3 videos de prueba gratuitos** por dispositivo antes de exigir registro.
- Sincronización automática a Supabase: los videos generados como invitado se migran de inmediato al registrarse o iniciar sesión.

### 5. 💎 Monetización, Carrito y Pasarelas de Pago
- Planes de Suscripción (*Prueba Gratuita $0*, *Creador $19/mes*, *Pro Studio $49/mes*) con switch anual con descuento del 20%.
- Paquetes de recarga rápida de créditos sin caducidad.
- Carrito de compras integrado con soporte para **Stripe** y **Mercado Pago** (Latinoamérica, Pix, Oxxo).
- Webhooks automáticos para acreditación de saldo en la tabla `profiles`.

---

## 🏗️ Estructura del Proyecto

```bash
ai-video-studio/
├── public/                     # Assets estáticos
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkout/       # Endpoint de creación y simulación de transacciones
│   │   │   ├── generate-script/# Generador de guiones con IA para TikTok/Reels
│   │   │   ├── live-stream/    # Inicializador de streaming WebRTC para avatares
│   │   │   └── webhooks/stripe/# Webhook de confirmación de pago de Stripe
│   │   ├── library/            # Biblioteca de videos generados y exportador MP4
│   │   ├── live/               # Studio de Streaming interactivo en tiempo real
│   │   ├── pricing/            # Planes de suscripción, paquetes y carrito
│   │   ├── studio/             # Editor principal de avatar 9:16
│   │   ├── globals.css         # Sistema de diseño dark mode, tokens y responsive
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page principal
│   ├── components/
│   │   ├── AuthModal.tsx       # Modal de Supabase Auth (Email + Google OAuth)
│   │   ├── Navbar.tsx          # Barra de navegación con contador de créditos
│   │   └── StudioPanel.tsx     # Controlador del estudio, preview de móvil y audio
│   ├── lib/
│   │   ├── credits.ts          # Gestión de créditos de invitado y migración
│   │   └── supabase/           # Clientes Browser y Server para Supabase
│   └── types/                  # Definiciones TypeScript completas
└── supabase/
    └── schema.sql              # Script SQL con DDL, RLS, Triggers y Buckets
```

---

## 🚀 Inicio Rápido (Local)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/omarstevenperezquintero171-beep/applive.git
cd applive
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-publishable-key
SUPABASE_SECRET_KEY=tu-service-role-key
STRIPE_SECRET_KEY=tu-stripe-secret-key
MERCADOPAGO_ACCESS_TOKEN=tu-mp-access-token
```

### 4. Configurar la Base de Datos en Supabase
Ejecuta el archivo [supabase/schema.sql](file:///c:/Users/PC-98541/Downloads/PosiUp/ai-video-studio/supabase/schema.sql) en el **SQL Editor** de tu consola de Supabase.

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

Abre tu navegador en:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🌐 Rutas de Navegación

| Ruta | Descripción |
| :--- | :--- |
| `/` | Landing Page con showcase de videos, métricas y call to action |
| `/studio` | Studio de Edición de Video Vertical 9:16 y Síntesis de Voz |
| `/live` | Avatar Interactivo en Tiempo Real por Streaming y Micrófono |
| `/library` | Biblioteca de videos generados, reproductor 9:16 y descarga MP4 |
| `/pricing` | Planes de precios, recarga de créditos y checkout con carrito |

---

## 🔒 Seguridad y Políticas RLS
- **Row Level Security (RLS)** activado en todas las tablas (`profiles`, `videos`, `transactions`, `interactive_sessions`).
- Triggers automáticos en `auth.users` que asignan créditos de bienvenida al registrarse.
- Endpoints de backend protegidos con validación de sesión.

---

## 📦 Despliegue en Vercel
1. Conecta el repositorio de GitHub en [Vercel](https://vercel.com).
2. Agrega las variables de entorno en el panel de configuración de Vercel.
3. El proyecto se compilará y desplegará automáticamente.
