// src/lib/studioTools.ts

export interface StudioToolConfig {
  slug: string;
  category: 'En Vivo' | 'Vídeo' | 'Audio & Voz' | 'Imagen & Fondos';
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  mode: 'camera' | 'streaming' | 'sales_agent' | 'faceswap' | 'video_creator' | 'tts' | 'voice_clone' | 'subtitles' | 'sfx' | 'background';
  defaultScript?: string;
  tips: { title: string; desc: string }[];
}

export const STUDIO_TOOLS: Record<string, StudioToolConfig> = {
  // 1. EN VIVO
  'camara-en-vivo': {
    slug: 'camara-en-vivo',
    category: 'En Vivo',
    title: 'Cámara en Vivo & Editor AR',
    subtitle: 'Editor de cámara interactiva con fondos virtuales, máscaras faciales de IA y grabación 9:16.',
    badge: 'WebRTC HD',
    icon: '📹',
    mode: 'camera',
    defaultScript: '¡Hola a todos! Bienvenidos a esta sesión en directo con avatares de IA en Mimik Studio.',
    tips: [
      { title: 'Regla de los 3 Segundos', desc: 'Comienza tu video con una pregunta intrigante o gancho visual antes de presentarte.' },
      { title: 'Iluminación Frontal', desc: 'Una luz suave frente a tu rostro mejora la precisión de las máscaras AR y el recorte de fondo.' },
      { title: 'Llamado a la Acción', desc: 'Indica a la audiencia que toque dos veces la pantalla para enviar corazones o comentar.' }
    ]
  },
  'avatar-streaming': {
    slug: 'avatar-streaming',
    category: 'En Vivo',
    title: 'Avatar Streaming Interactivo',
    subtitle: 'Transmisión en directo con avatar virtual hiperrealista, interacción por micrófono y chat en vivo.',
    badge: 'Latencia <300ms',
    icon: '🔴',
    mode: 'streaming',
    defaultScript: 'Transmitiendo en vivo: interactúa conmigo enviando comentarios o hablando al micrófono.',
    tips: [
      { title: 'Interacción Continua', desc: 'Responde a los nombres de los usuarios en el chat para disparar el tiempo de permanencia.' },
      { title: 'Alertas de Regalos', desc: 'Agradece en vivo cada rosa o regalo para incentivar mayores donaciones en TikTok Live.' },
      { title: 'Horarios Pico', desc: 'Transmite en los horarios de mayor tráfico (7:00 PM - 10:00 PM hora local) para máxima visibilidad.' }
    ]
  },
  'agente-ventas': {
    slug: 'agente-ventas',
    category: 'En Vivo',
    title: 'Agente de Ventas & Soporte Conversacional',
    subtitle: 'Avatar conversacional de IA entrenado para responder preguntas de clientes, cerrar ventas y agendar llamadas 24/7.',
    badge: 'Enterprise AI',
    icon: '🤖',
    mode: 'sales_agent',
    defaultScript: '¡Hola! Soy tu asesor comercial de Mimik AI. ¿En qué solución o plan puedo ayudarte hoy?',
    tips: [
      { title: 'Cualificación Rápida', desc: 'Haz preguntas cerradas en los primeros 30 segundos para identificar la necesidad del cliente.' },
      { title: 'Tono Empático', desc: 'Configura un tono cercano y profesional para generar confianza en decisiones de compra.' },
      { title: 'Llamada al Cierre', desc: 'Guía al prospecto directamente al enlace de checkout o agendamiento antes de finalizar.' }
    ]
  },
  'face-swap-live': {
    slug: 'face-swap-live',
    category: 'En Vivo',
    title: 'Face Swap en Streaming WebRTC',
    subtitle: 'Reemplazo facial y transferencia de rostro en directo con compensación de ángulo y expresiones naturales.',
    badge: 'HyperSwap Live',
    icon: '🔄',
    mode: 'faceswap',
    defaultScript: 'Probando reemplazo facial en tiempo real sobre streaming en vivo con IA.',
    tips: [
      { title: 'Resolución de Origen', desc: 'Utiliza una fotografía frontal nítida de tu rostro con iluminación neutra para la mejor fusión.' },
      { title: 'Movimientos Fluidos', desc: 'Evita movimientos bruscos para que el tracker facial mantenga el anclaje 3D perfecto.' },
      { title: 'Contraste con el Fondo', desc: 'Un fondo contrastado con tu silueta resalta el contorno del rostro swap.' }
    ]
  },

  // 2. VÍDEO
  'imagen-a-video': {
    slug: 'imagen-a-video',
    category: 'Vídeo',
    title: 'Imagen a Video Vertical 9:16',
    subtitle: 'Convierte fotos fijas, retratos o imágenes generadas en videos con sincronización labial perfecta.',
    badge: 'Lip-Sync AI',
    icon: '📱',
    mode: 'video_creator',
    defaultScript: 'Convierto cualquier fotografía estática en un video vertical ultra dinámico para redes sociales.',
    tips: [
      { title: 'Encuadre Vertical', desc: 'Asegúrate de que la foto tenga espacio arriba de la cabeza para el formato 9:16.' },
      { title: 'Resolución Óptima', desc: 'Fotos de al menos 1080x1080 píxeles garantizan una textura facial sin pixelación.' },
      { title: 'Ritmo del Guión', desc: 'Guiones de 15 a 30 segundos tienen la tasa de finalización más alta en Reels y Shorts.' }
    ]
  },
  'avatar-parlante': {
    slug: 'avatar-parlante',
    category: 'Vídeo',
    title: 'Avatar Parlante con Guión',
    subtitle: 'Generador de presentadores virtuales con entonación natural, sincronizados con guiones estructurados.',
    badge: 'Ultra HD',
    icon: '🗣️',
    mode: 'video_creator',
    defaultScript: 'Hola creador. Escribe tu guión y yo me encargaré de transmitir tu mensaje con voz profesional.',
    tips: [
      { title: 'Puntuación y Pausas', desc: 'Usa comas y puntos estratégicos para darle cadencia y pausas naturales a la voz del avatar.' },
      { title: 'Emoción Adecuada', desc: 'Selecciona una voz que combine con el objetivo de tu nicho (ejecutivo, creativo o enérgico).' },
      { title: 'Subtítulos Grandes', desc: 'El 80% de los usuarios de TikTok miran videos sin sonido: activa los subtítulos automáticos.' }
    ]
  },
  'formato-vertical': {
    slug: 'formato-vertical',
    category: 'Vídeo',
    title: 'Editor Vertical 9:16 para TikTok & Reels',
    subtitle: 'Estudio de recorte, márgenes de seguridad para UI de TikTok y optimización de retención.',
    badge: 'TikTok Ready',
    icon: '📐',
    mode: 'video_creator',
    defaultScript: 'Diseñado específicamente para ajustarse a los márgenes seguros de TikTok, Instagram Reels y YouTube Shorts.',
    tips: [
      { title: 'Zona Segura UI', desc: 'Mantén el texto y elementos clave en el centro para evitar que los botones de like los tapen.' },
      { title: 'Primeros 2 Segundos', desc: 'Inserta un corte visual o zoom rápido al inicio para captar al usuario que desliza el feed.' },
      { title: 'Música de Fondo', desc: 'Añade una pista de audio suave por debajo de la voz a un 15% de volumen.' }
    ]
  },
  'guion-a-video': {
    slug: 'guion-a-video',
    category: 'Vídeo',
    title: 'Generador de Guión a Video',
    subtitle: 'Crea historias y copys persuasivos con prompts estructurados de IA y transfiérelos al avatar.',
    badge: 'GPT-4o Script',
    icon: '📄',
    mode: 'video_creator',
    defaultScript: 'Genera un guión viral sobre cómo la inteligencia artificial ahorra 20 horas semanales a los creadores.',
    tips: [
      { title: 'Estructura AIDA', desc: 'Atención (gancho) → Interés (problema) → Deseo (solución) → Acción (CTA).' },
      { title: 'Palabras Clave Simples', desc: 'Evita tecnicismos rebuscados; habla como le hablarías a un amigo en una conversación casual.' },
      { title: 'Final con Pregunta', desc: 'Termina el guión con una pregunta para disparar los comentarios en la publicación.' }
    ]
  },
  'video-a-video': {
    slug: 'video-a-video',
    category: 'Vídeo',
    title: 'Video a Video & Reimaginación de Estilos',
    subtitle: 'Reemplaza el presentador o aplica filtros estilizados sobre videos previamente grabados.',
    badge: 'Neural Rerender',
    icon: '🎬',
    mode: 'video_creator',
    defaultScript: 'Reimagina este video cambiando el estilo visual a cinematográfico con un nuevo presentador de IA.',
    tips: [
      { title: 'Audio Limpio', desc: 'Un audio sin ruido de fondo facilita la sincronización al reemplazar al presentador.' },
      { title: 'Iluminación Estable', desc: 'Videos con iluminación homogénea producen resultados más limpios y sin parpadeos.' },
      { title: 'Consistencia de Personaje', desc: 'Usa el mismo avatar a lo largo de una serie de videos para crear identidad de marca.' }
    ]
  },

  // 3. AUDIO & VOZ
  'texto-a-voz': {
    slug: 'texto-a-voz',
    category: 'Audio & Voz',
    title: 'Texto a Voz Natural (TTS)',
    subtitle: 'Motor de síntesis vocal con decenas de acentos nativos en español (España, México, Argentina, Colombia).',
    badge: 'Voces Nativas',
    icon: '🎙️',
    mode: 'tts',
    defaultScript: 'Esta es una muestra de síntesis de voz hiperrealista con entonación nativa en español para creadores de contenido.',
    tips: [
      { title: 'Velocidad 1.1x', desc: 'Aumentar la velocidad a 1.1x en videos cortos retiene hasta un 18% más de audiencia.' },
      { title: 'Variación de Tono', desc: 'Ajusta el pitch según si buscas un estilo más formal corporativo o un tono relajado.' },
      { title: 'Respiraciones Naturales', desc: 'Nuestras voces incluyen micro-respiraciones que dan un toque humano inconfundible.' }
    ]
  },
  'clon-de-voz': {
    slug: 'clon-de-voz',
    category: 'Audio & Voz',
    title: 'Clon de Voz Personalizado (ElevenLabs)',
    subtitle: 'Clona tu propia voz con 30 segundos de grabación y úsala para narrar todos tus videos automáticamente.',
    badge: 'ElevenLabs API',
    icon: '🧬',
    mode: 'voice_clone',
    defaultScript: 'Con mi voz clonada puedo publicar videos diarios sin necesidad de entrar a un estudio de grabación.',
    tips: [
      { title: 'Micrófono de Calidad', desc: 'Graba en una habitación silenciosa sin eco para que el modelo clone tu timbre exacto.' },
      { title: 'Entonación Variada', desc: 'Lee con energía natural para que el clon aprenda tus matices expresivos.' },
      { title: 'Duración Recomendada', desc: 'Muestras de entre 30 y 60 segundos ofrecen el mejor balance de fidelidad acústica.' }
    ]
  },
  'subtitulos-tiktok': {
    slug: 'subtitulos-tiktok',
    category: 'Audio & Voz',
    title: 'Subtítulos Animados Estilo TikTok',
    subtitle: 'Transcripción automática con estilos de subtítulos dinámicos de alto impacto (Hormozi, MrBeast, Neon).',
    badge: 'Auto-Sync',
    icon: '💬',
    mode: 'subtitles',
    defaultScript: 'Subtítulos animados con colores llamativos que guían la mirada del espectador palabra por palabra.',
    tips: [
      { title: 'Resaltado de Palabras', desc: 'Pintar una palabra clave en amarillo o verde en cada frase multiplica el engagement.' },
      { title: 'Pocas Palabras por Línea', desc: 'Máximo 2 o 3 palabras a la vez para mantener el ritmo visual acelerado.' },
      { title: 'Fuente Gruesa', desc: 'Utiliza tipografías Sans-Serif bold (como The Bold Font o Montserrat Black) con sutil sombra.' }
    ]
  },
  'efectos-sonido': {
    slug: 'efectos-sonido',
    category: 'Audio & Voz',
    title: 'Efectos de Sonido SFX en Directo',
    subtitle: 'Biblioteca de efectos de sonido instantáneos para acentuar chistes, remates y transiciones.',
    badge: 'Instant Play',
    icon: '🎧',
    mode: 'sfx',
    defaultScript: 'Agrega aplausos, risas, bocinas y campanadas para enfatizar los momentos clave de tu video.',
    tips: [
      { title: 'Volumen Moderado', desc: 'Los efectos deben acompañar y nunca tapar la voz principal del presentador.' },
      { title: 'Sincronía con Cortes', desc: 'Dispara el efecto exactamente en el fotograma del cambio de plano o remate del texto.' },
      { title: 'No Abusar', desc: 'Un efecto de sonido cada 8 a 12 segundos mantiene el dinamismo sin saturar al usuario.' }
    ]
  },

  // 4. IMAGEN & FONDOS
  'cambio-de-fondo': {
    slug: 'cambio-de-fondo',
    category: 'Imagen & Fondos',
    title: 'Cambio de Fondo Inteligente',
    subtitle: 'Elimina y reemplaza fondos por sets de podcast, oficinas de lujo, gradientes oscuros o imágenes propias.',
    badge: 'AI Background',
    icon: '🖼️',
    mode: 'background',
    defaultScript: 'Transporta a tu avatar a cualquier escenario virtual con recorte neuronal ultra preciso.',
    tips: [
      { title: 'Profundidad de Campo', desc: 'Fondos con sutil desenfoque (bokeh) hacen que el avatar resalte como en una cámara réflex.' },
      { title: 'Paleta Coherente', desc: 'Asegúrate de que la iluminación del avatar concuerde con los colores del fondo.' },
      { title: 'Fondos Oscuros', desc: 'Los fondos en tonalidades azul marino y grafito transmiten máxima elegancia y retención.' }
    ]
  },
  'retrato-personalizado': {
    slug: 'retrato-personalizado',
    category: 'Imagen & Fondos',
    title: 'Retrato Personalizado & Face Swap',
    subtitle: 'Intercambio facial de alta fidelidad para posicionar tu rostro sobre avatares profesionales y modelos 3D.',
    badge: 'Ultra Fidelity',
    icon: '📸',
    mode: 'faceswap',
    defaultScript: 'Coloca tu rostro en cualquier personaje profesional o traje ejecutivo manteniendo tu identidad.',
    tips: [
      { title: 'Foto Sin Gafas', desc: 'Para el rostro de origen, una foto sin gafas oscuras ni sombras en los ojos mejora el swap.' },
      { title: 'Mismo Ángulo', desc: 'Elige un cuerpo objetivo que mire en la misma dirección que tu foto de referencia.' },
      { title: 'Expresión Relajada', desc: 'Una ligera sonrisa natural en la foto de origen produce los mejores resultados.' }
    ]
  }
};
