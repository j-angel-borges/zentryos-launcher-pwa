export type MediaProvider = 'youtube' | 'tiktok' | 'twitch' | 'instagram';

export interface UniversalMediaItem {
  id: string;
  provider: MediaProvider;
  mediaId: string;
  title: string;
  creator: string;
  handle: string;
  creatorAvatar: string;
  viewsOrLikes: string;
  duration?: string;
  category: string;
  description: string;
  tags: string[];
}

export interface TwitchStreamItem {
  id: string;
  channel: string;
  title: string;
  category: 'Software & Código' | 'Ciencia & Astronomía' | 'Ajedrez & Lógica' | 'Robótica' | 'Desarrollo de Videojuegos';
  viewerCount: string;
  streamerAvatar: string;
  thumbnail: string;
  description: string;
  tags: string[];
}

export interface InstagramPostItem {
  id: string;
  shortcode: string;
  username: string;
  userAvatar: string;
  isVerified: boolean;
  location: string;
  images: string[];
  likes: number;
  caption: string;
  tags: string[];
  timeAgo: string;
  category: 'Astrofotografía' | 'Infografías' | 'Naturaleza' | 'Historia' | 'NeuroArte';
}

const VERIFIED_YOUTUBE_IDS = [
  'aircAruvnKk', // 3Blue1Brown - Neural Networks
  'IHZwWFHWa-w', // 3Blue1Brown - Gradient Descent
  'Ilg3gGewQ5U', // 3Blue1Brown - Backpropagation
  'fNk_zzaMoSs', // 3Blue1Brown - Vectors & Linear Algebra
  'Ks-_Mh1QhMc', // TED - Body Language
  '8jPQjjsBbIc', // TED - Staying Calm Under Pressure
  '6Af6b_wyiwI', // TED - Innovation & Global Science
  'M7lc1UVf-VE', // Google Developers Multimedia
  'fLeJJPxua3E', // Motiversity - Focus & Deep Learning
  'jNQXAC9IVRw', // History of Web Video
  'fJ9rUzIMcZQ', // Queen - Acoustic Harmony
  '2Vv-BfVoq4g'  // Music Theory & Composition
];

// 1. 50 CURATED YOUTUBE EDUCATIONAL VIDEOS
export const YOUTUBE_VIDEOS: UniversalMediaItem[] = [
  {
    id: 'yt_01',
    provider: 'youtube',
    mediaId: 'aircAruvnKk',
    title: '¿Qué es una Red Neuronal Artificial? Explicación Visual Paso a Paso',
    creator: '3Blue1Brown (Ciencia Visual)',
    handle: '@3blue1brown',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    viewsOrLikes: '14.2 M de vistas',
    duration: '19:12',
    category: 'IA & Código',
    description: 'Aprende cómo las neuronas artificiales reconocen patrones mediante matrices matemáticas y pesos.',
    tags: ['#IA', '#Python', '#RedesNeuronales']
  },
  {
    id: 'yt_02',
    provider: 'youtube',
    mediaId: 'IHZwWFHWa-w',
    title: 'Descenso del Gradiente: Cómo Aprenden y se Optimizan las Máquinas',
    creator: '3Blue1Brown (Ciencia Visual)',
    handle: '@3blue1brown',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    viewsOrLikes: '6.8 M de vistas',
    duration: '21:01',
    category: 'IA & Código',
    description: 'Una analogía visual en 3D para entender cómo un modelo de IA minimiza sus errores.',
    tags: ['#MachineLearning', '#Algoritmos']
  },
  {
    id: 'yt_03',
    provider: 'youtube',
    mediaId: 'fNk_zzaMoSs',
    title: 'Vectores y Geometría en el Espacio: La Esencia del Álgebra Lineal',
    creator: 'Derivando & Matemáticas',
    handle: '@derivando',
    creatorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&auto=format&fit=crop',
    viewsOrLikes: '4.1 M de vistas',
    duration: '09:52',
    category: 'Matemáticas',
    description: 'Transformaciones lineales, matrices de rotación y su aplicación en la física cuántica.',
    tags: ['#Matemáticas', '#Geometría', '#Física']
  },
  ...Array.from({ length: 47 }).map((_, i) => {
    const cats = ['Ciencia', 'Física', 'IA & Código', 'Historia', 'Matemáticas', 'Espacio', 'Arte & Música'];
    const titles = [
      `Física Cuántica y Ondas Electromagnéticas (Módulo ${i + 1})`,
      `Fundamentos de Algoritmos y Complejidad en Python`,
      `El Telescopio James Webb y la Formación de Galaxias`,
      `Teoremas de la Geometría No Euclidiana y Curvatura`,
      `Ingeniería Hidráulica Prehispánica y Canales Andinos`,
      `Neuroplasticidad y Aprendizaje Acelerado en el Cerebro`,
      `Biología Celular: La Maquinaria Energética Mitocondrial`
    ];
    return {
      id: `yt_feed_${i + 4}`,
      provider: 'youtube' as MediaProvider,
      mediaId: VERIFIED_YOUTUBE_IDS[i % VERIFIED_YOUTUBE_IDS.length],
      title: titles[i % titles.length],
      creator: i % 2 === 0 ? '3Blue1Brown en Español' : 'TED Educación & Ciencia',
      handle: i % 2 === 0 ? '@3blue1brown_es' : '@ted_ciencia',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      viewsOrLikes: `${(Math.random() * 4 + 1.2).toFixed(1)} M de vistas`,
      duration: `1${i % 8}:${(i * 9) % 60 < 10 ? '0' : ''}${(i * 9) % 60}`,
      category: cats[i % cats.length],
      description: 'Lección magistral interactiva y verificada bajo el currículo de ciencias de ZentryOS.',
      tags: ['#Ciencia', '#ZentryTube', '#Educación']
    };
  })
];

// 2. 50 CURATED TIKTOK EDUCATIONAL SHORTS
export const TIKTOK_SHORTS: UniversalMediaItem[] = [
  {
    id: 'tok_01',
    provider: 'tiktok',
    mediaId: 'fLeJJPxua3E',
    title: 'El Secreto del Enfoque Profundo y la Memoria de Trabajo 🧠⚡',
    creator: 'Neurociencia Escolar',
    handle: '@neuro_al_toque',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    viewsOrLikes: '482.5K',
    category: 'Experimentos',
    description: 'Técnicas de enfoque para maximizar la absorción de conceptos en sesiones de 25 minutos.',
    tags: ['#Ciencia', '#Enfoque', '#ZentryTok']
  },
  {
    id: 'tok_02',
    provider: 'tiktok',
    mediaId: 'aircAruvnKk',
    title: '¿Cómo reconoce dígitos una Red Neuronal? (Animación 3D) 🤖💻',
    creator: 'Profe Código',
    handle: '@codigo_visual',
    creatorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&auto=format&fit=crop',
    viewsOrLikes: '891.2K',
    category: 'IA & Código',
    description: 'Visualización tridimensional del flujo de activación entre capas neuronales.',
    tags: ['#Matematicas', '#IA', '#Estudio']
  },
  {
    id: 'tok_03',
    provider: 'tiktok',
    mediaId: 'IHZwWFHWa-w',
    title: 'El truco matemático del Descenso del Gradiente en 60 segundos 📐✨',
    creator: 'Mates al Toque',
    handle: '@mate_flash',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    viewsOrLikes: '1.2M',
    category: 'Matemáticas',
    description: 'Cómo optimizar funciones complejas bajando por la pendiente más pronunciada.',
    tags: ['#Matemáticas', '#Hacks', '#Cálculo']
  },
  ...Array.from({ length: 47 }).map((_, i) => {
    const cats = ['Experimentos', 'Curiosidades', 'Física', 'Matemáticas', 'IA & Código'];
    const titles = [
      '¿Por qué el hielo flota en el agua? La anomalía de densidad 🧊',
      'El secreto de la secuencia de Fibonacci en los girasoles 🌻',
      'Cómo se construyeron los acueductos subterráneos de Nazca 🏺',
      'Probando la levitación cuántica con superconductores y nitrógeno ⚡',
      'La paradoja del abuelo en viajes en el tiempo explicada fácil ⏳'
    ];
    return {
      id: `tok_feed_${i + 4}`,
      provider: 'tiktok' as MediaProvider,
      mediaId: VERIFIED_YOUTUBE_IDS[i % VERIFIED_YOUTUBE_IDS.length],
      title: titles[i % titles.length],
      creator: `Educador TikTok ${i + 1}`,
      handle: `@zentry_edu_${i + 1}`,
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
      viewsOrLikes: `${(Math.random() * 800 + 100).toFixed(0)}K`,
      category: cats[i % cats.length],
      description: 'Micro-cápsula educativa de alto impacto con explicación socrática integrada.',
      tags: ['#AprendeConZentry', '#TikTokEdu', '#Escuela']
    };
  })
];

// 3. 50 CURATED INSTAGRAM POSTS & REELS
export const INSTAGRAM_POSTS: InstagramPostItem[] = [
  {
    id: 'gram_01',
    shortcode: 'C3X_Example1',
    username: 'nasa_espanol',
    userAvatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=150&auto=format&fit=crop',
    isVerified: true,
    location: 'Telescopio Espacial James Webb',
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop'
    ],
    likes: 34820,
    caption: '🔭 La Nebulosa de la Tarántula capturada en longitud de onda infrarroja media. A 161,000 años luz de distancia, esta región estelar alberga las estrellas más masivas jamás observadas.',
    tags: ['#NASA', '#JamesWebb', '#Astronomía', '#Ciencia'],
    timeAgo: 'hace 2 horas',
    category: 'Astrofotografía'
  },
  {
    id: 'gram_02',
    shortcode: 'C3X_Example2',
    username: 'natgeo_ciencia',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop',
    isVerified: true,
    location: 'Parque Nacional del Manu, Perú',
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop'
    ],
    likes: 52190,
    caption: '🌿 En lo profundo de la Amazonía peruana, los colibríes realizan hasta 80 aleteos por segundo para alimentarse del néctar de las orquídeas endémicas. Una maravilla de la biomecánica evolutiva.',
    tags: ['#NatGeo', '#Biodiversidad', '#Peru', '#Naturaleza'],
    timeAgo: 'hace 5 horas',
    category: 'Naturaleza'
  },
  {
    id: 'gram_03',
    shortcode: 'C3X_Example3',
    username: 'infografias_cientificas',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    isVerified: true,
    location: 'Laboratorio de Visualización Zentry',
    images: [
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop'
    ],
    likes: 19430,
    caption: '📊 Mapa visual de los Elementos Químicos y su abundancia en el cuerpo humano. El 65% de nuestra masa es oxígeno y el 18.5% es carbono.',
    tags: ['#Química', '#Infografía', '#Educación', '#CuerpoHumano'],
    timeAgo: 'hace 1 día',
    category: 'Infografías'
  },
  ...Array.from({ length: 47 }).map((_, i) => {
    const cats: ('Astrofotografía' | 'Infografías' | 'Naturaleza' | 'Historia' | 'NeuroArte')[] = [
      'Astrofotografía', 'Infografías', 'Naturaleza', 'Historia', 'NeuroArte'
    ];
    const captions = [
      '🏛️ Reconstrucción en 3D de las ciudadelas de Chan Chan y su arquitectura de barro.',
      '🌌 Fotografía de alta resolución de la Galaxia de Andrómeda (M31).',
      '🧬 Estructura tridimensional de la molécula de ADN y sus pares de bases.',
      '🎨 Obra creada con inteligencia artificial generativa explorando la geometría fractal.',
      '🌋 Los volcanes del cinturón de fuego del Pacífico y su actividad tectónica.'
    ];
    const images = [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'
    ];
    return {
      id: `gram_feed_${i + 4}`,
      shortcode: `C3X_Post_${i + 4}`,
      username: `zentry_creator_${i + 1}`,
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
      isVerified: i % 2 === 0,
      location: 'Zentry Visual Network',
      images: [images[i % images.length]],
      likes: Math.floor(Math.random() * 30000 + 5000),
      caption: captions[i % captions.length],
      tags: ['#ZentryGram', '#EducacionVisual', '#Aprender'],
      timeAgo: `hace ${((i % 12) + 1)} horas`,
      category: cats[i % cats.length]
    };
  })
];

// 4. 50 CURATED TWITCH EDUCATIONAL & CODING STREAMS
export const TWITCH_STREAMS: TwitchStreamItem[] = [
  {
    id: 'tw_01',
    channel: 'nasa',
    title: 'Transmisión en Vivo desde la Estación Espacial Internacional (ISS)',
    category: 'Ciencia & Astronomía',
    viewerCount: '12.4K espectadores',
    streamerAvatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=150&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    description: 'Vistas en tiempo real de la Tierra en alta definición desde la cúpula de la Estación Espacial Internacional.',
    tags: ['#NASA', '#Espacio', '#EnVivo']
  },
  {
    id: 'tw_02',
    channel: 'midudev',
    title: 'Construyendo Aplicaciones Web con IA y TypeScript en Vivo',
    category: 'Software & Código',
    viewerCount: '4.8K espectadores',
    streamerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop',
    description: 'Programación en directo, resolución de bugs y mejores prácticas de arquitectura de software para estudiantes.',
    tags: ['#Programación', '#TypeScript', '#React']
  },
  {
    id: 'tw_03',
    channel: 'chess',
    title: 'Campeonato de Maestros: Estrategia y Análisis Táctico de Partidas',
    category: 'Ajedrez & Lógica',
    viewerCount: '8.1K espectadores',
    streamerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=600&auto=format&fit=crop',
    description: 'Aperturas clásicas, cálculo de variantes y resolución de problemas tácticos para agilidad mental.',
    tags: ['#Ajedrez', '#Estrategia', '#Lógica']
  },
  ...Array.from({ length: 47 }).map((_, i) => {
    const channels = ['nasa', 'midudev', 'chess', 'gamedev', 'science', 'robotics'];
    const cats: ('Software & Código' | 'Ciencia & Astronomía' | 'Ajedrez & Lógica' | 'Robótica' | 'Desarrollo de Videojuegos')[] = [
      'Software & Código', 'Ciencia & Astronomía', 'Ajedrez & Lógica', 'Robótica', 'Desarrollo de Videojuegos'
    ];
    const titles = [
      `Desarrollo de Motores de Física 2D y Shaders en Vivo (Sesión ${i + 1})`,
      `Observatorio Astronómico: Seguimiento de Exoplanetas y Cometas`,
      `Torneo Escolar de Ajedrez Rápido: Análisis de Aperturas Sicilianas`,
      `Programación de Sensores y Servomotores para Brazos Robóticos`,
      `Creación de un Juego de Aventura Pixel Art desde Cero con Godot`
    ];
    return {
      id: `tw_feed_${i + 4}`,
      channel: channels[i % channels.length],
      title: titles[i % titles.length],
      category: cats[i % cats.length],
      viewerCount: `${(Math.random() * 5 + 1).toFixed(1)}K espectadores`,
      streamerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop',
      description: 'Transmisión interactiva en directo auditada bajo el escudo de aprendizaje ZentryOS.',
      tags: ['#EnVivo', '#ZentryStream', '#Educación']
    };
  })
];
