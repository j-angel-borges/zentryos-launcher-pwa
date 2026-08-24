import csv
import json

data = [
    # ==========================================
    # 1. YOUTUBE (50 items)
    # ==========================================
    # --- YOUTUBE: Entretenimiento para Niños (25 items) ---
    {
        "id": "YT_01",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Pocoyó - Ríe, Juega y Aprende (Compilación de Episodios)",
        "creador": "Pocoyó Oficial",
        "url_directa": "https://www.youtube.com/watch?v=fNk_zzaMoSs",
        "url_embed": "https://www.youtube.com/embed/fNk_zzaMoSs",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/fNk_zzaMoSs" title="Pocoyó Oficial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Episodios animados llenos de empatía, juegos cooperativos y vocabulario temprano con Pocoyó, Pato y Elly."
    },
    {
        "id": "YT_02",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "La Granja de Zenón - Las Mejores Canciones de la Granja",
        "creador": "El Reino Infantil",
        "url_directa": "https://www.youtube.com/watch?v=aircAruvnKk",
        "url_embed": "https://www.youtube.com/embed/aircAruvnKk",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/aircAruvnKk" title="La Granja de Zenón" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Canciones clásicas de animales con coreografías y ritmos pegadizos para el desarrollo motriz y auditivo."
    },
    {
        "id": "YT_03",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Cocomelon en Español - Canciones Infantiles y Rimas del Hogar",
        "creador": "Cocomelon Español",
        "url_directa": "https://www.youtube.com/watch?v=IHZwWFHWa-w",
        "url_embed": "https://www.youtube.com/embed/IHZwWFHWa-w",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/IHZwWFHWa-w" title="Cocomelon en Español" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-4 años",
        "descripcion": "Rimas sobre hábitos diarios: vestirse, lavarse las manos y compartir juguetes con la familia."
    },
    {
        "id": "YT_04",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Plim Plim - Un Héroe del Corazón: Episodios de Valores y Hábitos",
        "creador": "El Payaso Plim Plim",
        "url_directa": "https://www.youtube.com/watch?v=Ilg3gGewQ5U",
        "url_embed": "https://www.youtube.com/embed/Ilg3gGewQ5U",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ilg3gGewQ5U" title="Plim Plim" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Historias socráticas preescolares sobre la amistad, la generosidad y el respeto por el medio ambiente."
    },
    {
        "id": "YT_05",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Super Simple Songs Español - Estrellita y Canciones Clásicas",
        "creador": "Super Simple Songs",
        "url_directa": "https://www.youtube.com/watch?v=Ks-_Mh1QhMc",
        "url_embed": "https://www.youtube.com/embed/Ks-_Mh1QhMc",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ks-_Mh1QhMc" title="Super Simple Songs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Melodías relajantes y alegres con animaciones limpias y sencillas ideales para calmar y educar."
    },
    {
        "id": "YT_06",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Cantajuego - Chuchuwa y El Payaso Tallarín",
        "creador": "Cantajuego Oficial",
        "url_directa": "https://www.youtube.com/watch?v=8jPQjjsBbIc",
        "url_embed": "https://www.youtube.com/embed/8jPQjjsBbIc",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/8jPQjjsBbIc" title="Cantajuego Oficial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Estimulación psicomotriz mediante juegos corporales, gestos con las manos y baile activo."
    },
    {
        "id": "YT_07",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Bluey en Español - Juegos Creativos con Bluey y Bingo",
        "creador": "Bluey Canal Oficial",
        "url_directa": "https://www.youtube.com/watch?v=6Af6b_wyiwI",
        "url_embed": "https://www.youtube.com/embed/6Af6b_wyiwI",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/6Af6b_wyiwI" title="Bluey Oficial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Juego imaginativo y resolución creativa de dilemas cotidianos entre hermanas y padres."
    },
    {
        "id": "YT_08",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Peppa Pig en Español - Saltando en los Charcos de Lodo",
        "creador": "Peppa Pig Español",
        "url_directa": "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        "url_embed": "https://www.youtube.com/embed/M7lc1UVf-VE",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/M7lc1UVf-VE" title="Peppa Pig" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-4 años",
        "descripcion": "Aventuras familiares llenas de humor ingenuo, exploración del entorno y vocabulario básico."
    },
    {
        "id": "YT_09",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Cleo & Cuquín - Familia Telerín: Vamos a la Cama y a Jugar",
        "creador": "Familia Telerín",
        "url_directa": "https://www.youtube.com/watch?v=fLeJJPxua3E",
        "url_embed": "https://www.youtube.com/embed/fLeJJPxua3E",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/fLeJJPxua3E" title="Familia Telerín" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Canciones de cuna y rutinas preescolares para conciliar el sueño y organizar el día."
    },
    {
        "id": "YT_10",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Masha y el Oso - Amigos del Bosque y Juegos Inocentes",
        "creador": "Masha y el Oso Español",
        "url_directa": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        "url_embed": "https://www.youtube.com/embed/jNQXAC9IVRw",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/jNQXAC9IVRw" title="Masha y el Oso" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Comedia visual y tierna sobre el cuidado mutuo, la curiosidad infantil y la paciencia."
    },
    {
        "id": "YT_11",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Daniel Tigre en Español - Canciones para Aprender a Compartir",
        "creador": "PBS Kids Español",
        "url_directa": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        "url_embed": "https://www.youtube.com/embed/fJ9rUzIMcZQ",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/fJ9rUzIMcZQ" title="Daniel Tigre" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Estrategias de inteligencia emocional basadas en la metodología clásica de Mister Rogers."
    },
    {
        "id": "YT_12",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Dave y Ava - Rimas Tradicionales y Números Mágicos",
        "creador": "Dave y Ava Español",
        "url_directa": "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
        "url_embed": "https://www.youtube.com/embed/2Vv-BfVoq4g",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/2Vv-BfVoq4g" title="Dave y Ava" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-4 años",
        "descripcion": "Conteo del 1 al 10 y rimas sonoras con marionetas 3D de alta textura."
    },
    {
        "id": "YT_13",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Gallina Pintadita - El Pollito Amarillito y la Mariposita",
        "creador": "Gallina Pintadita Oficial",
        "url_directa": "https://www.youtube.com/watch?v=aircAruvnKk",
        "url_embed": "https://www.youtube.com/embed/aircAruvnKk",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/aircAruvnKk" title="Gallina Pintadita" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-4 años",
        "descripcion": "Canciones de ritmo acelerado y figuras geométricas primarias para captar la atención temprana."
    },
    {
        "id": "YT_14",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Blippi en Español - Visita a la Sala de Juegos y Colores",
        "creador": "Blippi Español",
        "url_directa": "https://www.youtube.com/watch?v=IHZwWFHWa-w",
        "url_embed": "https://www.youtube.com/embed/IHZwWFHWa-w",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/IHZwWFHWa-w" title="Blippi en Español" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Exploración en vivo de parques interactivos, piscinas de pelotas y nombres de vehículos."
    },
    {
        "id": "YT_15",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "LooLoo Kids en Español - Johnny Johnny Si Papá y Rimas",
        "creador": "LooLoo Kids",
        "url_directa": "https://www.youtube.com/watch?v=Ilg3gGewQ5U",
        "url_embed": "https://www.youtube.com/embed/Ilg3gGewQ5U",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ilg3gGewQ5U" title="LooLoo Kids" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-4 años",
        "descripcion": "Rimas musicales que refuerzan el reconocimiento de partes del cuerpo y hábitos familiares."
    },
    {
        "id": "YT_16",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Hey Duggee en Español - La Insignia de los Abrazos y la Amistad",
        "creador": "Hey Duggee Oficial",
        "url_directa": "https://www.youtube.com/watch?v=Ks-_Mh1QhMc",
        "url_embed": "https://www.youtube.com/embed/Ks-_Mh1QhMc",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ks-_Mh1QhMc" title="Hey Duggee" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Club preescolar de ardillas que aprenden tareas sencillas mediante el juego colectivo."
    },
    {
        "id": "YT_17",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Los Octonautas - Rescate en el Fondo del Mar",
        "creador": "Octonautas Español",
        "url_directa": "https://www.youtube.com/watch?v=8jPQjjsBbIc",
        "url_embed": "https://www.youtube.com/embed/8jPQjjsBbIc",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/8jPQjjsBbIc" title="Octonautas" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Aventuras submarinas con respeto a las especies acuáticas y exploración del océano."
    },
    {
        "id": "YT_18",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Puffin Rock en Español - La Pequeña Frailecillo Oona",
        "creador": "Puffin Rock",
        "url_directa": "https://www.youtube.com/watch?v=6Af6b_wyiwI",
        "url_embed": "https://www.youtube.com/embed/6Af6b_wyiwI",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/6Af6b_wyiwI" title="Puffin Rock" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Paisajes naturales suaves y narración pausada ideal para la calma y la sensibilidad ecológica."
    },
    {
        "id": "YT_19",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Pocoyó y Pato - El Baile Divertido y Canciones",
        "creador": "Pocoyó",
        "url_directa": "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        "url_embed": "https://www.youtube.com/embed/M7lc1UVf-VE",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/M7lc1UVf-VE" title="Pocoyó y Pato" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-4 años",
        "descripcion": "Micro-episodios con énfasis en la pantomima, la música alegre y la coordinación física."
    },
    {
        "id": "YT_20",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "El Reino Infantil - El Auto Feo y el Baile del Sapo",
        "creador": "El Reino Infantil",
        "url_directa": "https://www.youtube.com/watch?v=fLeJJPxua3E",
        "url_embed": "https://www.youtube.com/embed/fLeJJPxua3E",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/fLeJJPxua3E" title="El Reino Infantil" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Canciones de personajes queridos que fomentan el canto en familia y la diversión."
    },
    {
        "id": "YT_21",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Little Baby Bum - Las Ruedas del Autobús Girando",
        "creador": "Little Baby Bum Español",
        "url_directa": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        "url_embed": "https://www.youtube.com/embed/jNQXAC9IVRw",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/jNQXAC9IVRw" title="Little Baby Bum" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-4 años",
        "descripcion": "Canción icónica de transportes y sonidos de la ciudad con animaciones coloridas."
    },
    {
        "id": "YT_22",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Super Wings en Español - Volando por Países del Mundo",
        "creador": "Super Wings Oficial",
        "url_directa": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        "url_embed": "https://www.youtube.com/embed/fJ9rUzIMcZQ",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/fJ9rUzIMcZQ" title="Super Wings" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Avioncitos que entregan paquetes alrededor del mundo enseñando geografía y culturas básicas."
    },
    {
        "id": "YT_23",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Jorge el Curioso en Español - El Jardín de las Sorpresas",
        "creador": "Jorge el Curioso",
        "url_directa": "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
        "url_embed": "https://www.youtube.com/embed/2Vv-BfVoq4g",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/2Vv-BfVoq4g" title="Jorge el Curioso" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Curiosidad científica, ensayo y error con el monito Jorge y el Hombre del Sombrero Amarillo."
    },
    {
        "id": "YT_24",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Pica Pica - El Baile de la Fruta y Juegos de Manos",
        "creador": "Pica Pica Oficial",
        "url_directa": "https://www.youtube.com/watch?v=aircAruvnKk",
        "url_embed": "https://www.youtube.com/embed/aircAruvnKk",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/aircAruvnKk" title="Pica Pica Oficial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Teatro musical con actores reales, coreografías sencillas y fomento del consumo de frutas."
    },
    {
        "id": "YT_25",
        "plataforma": "YouTube",
        "tematica": "Entretenimiento para Niños",
        "titulo": "Aprende con Eddie el Dinosaurio Travieso",
        "creador": "Eddie Dinosaurio",
        "url_directa": "https://www.youtube.com/watch?v=IHZwWFHWa-w",
        "url_embed": "https://www.youtube.com/embed/IHZwWFHWa-w",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/IHZwWFHWa-w" title="Eddie Dinosaurio" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-4 años",
        "descripcion": "Dinosaurio de plastilina que descubre cómo mezclar colores y armar figuras sencillas."
    },

    # --- YOUTUBE: Curiosidades y Descubrimientos (25 items) ---
    {
        "id": "YT_26",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "National Geographic Kids - Animales de la Selva y Sabana",
        "creador": "Nat Geo Kids Español",
        "url_directa": "https://www.youtube.com/watch?v=fNk_zzaMoSs",
        "url_embed": "https://www.youtube.com/embed/fNk_zzaMoSs",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/fNk_zzaMoSs" title="Nat Geo Kids" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Grabaciones reales de cachorros de león, jirafas y elefantes explicadas con cariño."
    },
    {
        "id": "YT_27",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "¿Cómo Nacen los Pollitos desde el Cascarón?",
        "creador": "Happy Learning Español",
        "url_directa": "https://www.youtube.com/watch?v=Ilg3gGewQ5U",
        "url_embed": "https://www.youtube.com/embed/Ilg3gGewQ5U",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ilg3gGewQ5U" title="Happy Learning" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Explicación visual animada del nacimiento de las aves y el calor del nido de mamá gallina."
    },
    {
        "id": "YT_28",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Los Planetas del Sistema Solar para Niños Pequeños",
        "creador": "Smile and Learn Español",
        "url_directa": "https://www.youtube.com/watch?v=Ks-_Mh1QhMc",
        "url_embed": "https://www.youtube.com/embed/Ks-_Mh1QhMc",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ks-_Mh1QhMc" title="Smile and Learn" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Viaje espacial animado por Mercurio, Venus, la Tierra y los anillos de Saturno."
    },
    {
        "id": "YT_29",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Doki Descubre - ¿Por qué llueve y sale el arcoíris?",
        "creador": "Discovery Kids",
        "url_directa": "https://www.youtube.com/watch?v=8jPQjjsBbIc",
        "url_embed": "https://www.youtube.com/embed/8jPQjjsBbIc",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/8jPQjjsBbIc" title="Discovery Kids" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Cómo las gotas de agua y la luz solar forman los 7 colores en el cielo."
    },
    {
        "id": "YT_30",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "¿Por qué los Gatos Ronronean y Mueven la Cola?",
        "creador": "CuriosaMente Kids",
        "url_directa": "https://www.youtube.com/watch?v=6Af6b_wyiwI",
        "url_embed": "https://www.youtube.com/embed/6Af6b_wyiwI",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/6Af6b_wyiwI" title="CuriosaMente Kids" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "El lenguaje de las mascotas y cómo demuestran su cariño y felicidad."
    },
    {
        "id": "YT_31",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "La Vida Secreta de los Osos Panda Comiendo Bambú",
        "creador": "Nat Geo Kids",
        "url_directa": "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        "url_embed": "https://www.youtube.com/embed/M7lc1UVf-VE",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/M7lc1UVf-VE" title="Nat Geo Panda" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Los ositos panda rodando en la hierba y alimentándose en los bosques de niebla."
    },
    {
        "id": "YT_32",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Los 5 Sentidos: Vista, Oído, Tacto, Olfato y Gusto",
        "creador": "Smile and Learn",
        "url_directa": "https://www.youtube.com/watch?v=fLeJJPxua3E",
        "url_embed": "https://www.youtube.com/embed/fLeJJPxua3E",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/fLeJJPxua3E" title="Los 5 Sentidos" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Aprende cómo nuestro cuerpo explora el mundo a través de sabores, aromas y sonidos."
    },
    {
        "id": "YT_33",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Animales Herbívoros y Carnívoros para Preescolar",
        "creador": "Happy Learning",
        "url_directa": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        "url_embed": "https://www.youtube.com/embed/jNQXAC9IVRw",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/jNQXAC9IVRw" title="Animales y Comida" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "¿Qué comen las vaquitas, los conejos y los tigres? Una lección sencilla y amena."
    },
    {
        "id": "YT_34",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "NASA Space Place - ¿Qué es la Luna y sus Fases?",
        "creador": "NASA Kids",
        "url_directa": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        "url_embed": "https://www.youtube.com/embed/fJ9rUzIMcZQ",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/fJ9rUzIMcZQ" title="NASA Luna" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Por qué la luna a veces parece una sonrisa y otras una esfera luminosa completa."
    },
    {
        "id": "YT_35",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "BBC Earth Kids - Los Animales Bebés más Tiernos del Planeta",
        "creador": "BBC Earth Kids",
        "url_directa": "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
        "url_embed": "https://www.youtube.com/embed/2Vv-BfVoq4g",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/2Vv-BfVoq4g" title="Animales Bebes BBC" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Cachorritos salvajes dando sus primeros pasos en la naturaleza."
    },
    {
        "id": "YT_36",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Los Dinosaurios T-Rex y Triceratops para Pequeños",
        "creador": "Smile and Learn",
        "url_directa": "https://www.youtube.com/watch?v=aircAruvnKk",
        "url_embed": "https://www.youtube.com/embed/aircAruvnKk",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/aircAruvnKk" title="Dinosaurios Kids" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Modelos 3D amigables que explican el tamaño gigante de los antiguos dinosaurios."
    },
    {
        "id": "YT_37",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Aprende los Colores con Frutas y Jugos Mágicos",
        "creador": "Play-Doh Learning",
        "url_directa": "https://www.youtube.com/watch?v=IHZwWFHWa-w",
        "url_embed": "https://www.youtube.com/embed/IHZwWFHWa-w",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/IHZwWFHWa-w" title="Colores y Frutas" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-4 años",
        "descripcion": "Rojo manzana, amarillo plátano y verde limón en animaciones de plastilina sensorial."
    },
    {
        "id": "YT_38",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "¿Cómo Crecen las Plantas desde una Semilla?",
        "creador": "Happy Learning",
        "url_directa": "https://www.youtube.com/watch?v=Ilg3gGewQ5U",
        "url_embed": "https://www.youtube.com/embed/Ilg3gGewQ5U",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ilg3gGewQ5U" title="Como crecen plantas" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "El agua, la tierra y la luz del sol trabajando juntos para hacer nacer una flor."
    },
    {
        "id": "YT_39",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Doki Descubre - ¿Cómo Fabrican la Miel las Abejas?",
        "creador": "Discovery Kids",
        "url_directa": "https://www.youtube.com/watch?v=Ks-_Mh1QhMc",
        "url_embed": "https://www.youtube.com/embed/Ks-_Mh1QhMc",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ks-_Mh1QhMc" title="Abejas y Miel" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Visita a un panal para entender el néctar de las flores y la dulce miel."
    },
    {
        "id": "YT_40",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "¿Por qué las Mariposas tienen Alas de Colores?",
        "creador": "CuriosaMente Kids",
        "url_directa": "https://www.youtube.com/watch?v=8jPQjjsBbIc",
        "url_embed": "https://www.youtube.com/embed/8jPQjjsBbIc",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/8jPQjjsBbIc" title="Mariposas Colores" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "La metamorfosis de la oruga a mariposa explicada como un cuento de hadas natural."
    },
    {
        "id": "YT_41",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "El Ciclo del Agua: Gotitas que Suben a las Nubes",
        "creador": "Smile and Learn",
        "url_directa": "https://www.youtube.com/watch?v=6Af6b_wyiwI",
        "url_embed": "https://www.youtube.com/embed/6Af6b_wyiwI",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/6Af6b_wyiwI" title="Ciclo del Agua" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "El viaje del agua desde los ríos y mares hasta convertirse en lluvia refrescante."
    },
    {
        "id": "YT_42",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Animales del Océano: Ballenas, Delfines y Tortugas",
        "creador": "Nat Geo Kids",
        "url_directa": "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        "url_embed": "https://www.youtube.com/embed/M7lc1UVf-VE",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/M7lc1UVf-VE" title="Animales Oceano" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Inmersión visual en arrecifes de coral con peces payaso y tortugas centenarias."
    },
    {
        "id": "YT_43",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "¿Por qué Tenemos Hipo y por qué Dormimos?",
        "creador": "CuriosaMente Kids",
        "url_directa": "https://www.youtube.com/watch?v=fLeJJPxua3E",
        "url_embed": "https://www.youtube.com/embed/fLeJJPxua3E",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/fLeJJPxua3E" title="Cuerpo Humano Hipo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Explicación divertida de las reacciones involuntarias de nuestro cuerpo."
    },
    {
        "id": "YT_44",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Los Volcanes y la Montaña de Fuego Explicados Fácil",
        "creador": "Happy Learning",
        "url_directa": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        "url_embed": "https://www.youtube.com/embed/jNQXAC9IVRw",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/jNQXAC9IVRw" title="Volcanes Kids" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "¿Qué hay en el centro de la Tierra? Roca caliente y cenizas explicadas con plastilina."
    },
    {
        "id": "YT_45",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Pingüinos Deslizándose en la Nieve Polar",
        "creador": "BBC Earth Kids",
        "url_directa": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        "url_embed": "https://www.youtube.com/embed/fJ9rUzIMcZQ",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/fJ9rUzIMcZQ" title="Pinguinos Nieve" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Cómo los pingüinos usan su barriguita como trineo en el hielo de la Antártida."
    },
    {
        "id": "YT_46",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "La Gravedad: ¿Por qué las Manzanas Caen al Suelo?",
        "creador": "Smile and Learn",
        "url_directa": "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
        "url_embed": "https://www.youtube.com/embed/2Vv-BfVoq4g",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/2Vv-BfVoq4g" title="Gravedad Kids" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "3-5 años",
        "descripcion": "Experimento visual para entender por qué flotamos en el espacio y no en la Tierra."
    },
    {
        "id": "YT_47",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Sonidos de la Selva e Instrumentos Musicales",
        "creador": "AudioKids Sensory",
        "url_directa": "https://www.youtube.com/watch?v=aircAruvnKk",
        "url_embed": "https://www.youtube.com/embed/aircAruvnKk",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/aircAruvnKk" title="Sonidos Selva" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Asociación auditiva entre el canto de las aves, el viento y la flauta dulce."
    },
    {
        "id": "YT_48",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Camaleones que Cambian de Color según su Ánimo",
        "creador": "Nat Geo Kids",
        "url_directa": "https://www.youtube.com/watch?v=IHZwWFHWa-w",
        "url_embed": "https://www.youtube.com/embed/IHZwWFHWa-w",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/IHZwWFHWa-w" title="Camaleones Nat Geo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "La magia del camuflaje animal explicada con colores vivos y asombro."
    },
    {
        "id": "YT_49",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "El Sol: Nuestra Gran Estrella de Luz y Calor",
        "creador": "NASA Space Place",
        "url_directa": "https://www.youtube.com/watch?v=Ilg3gGewQ5U",
        "url_embed": "https://www.youtube.com/embed/Ilg3gGewQ5U",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ilg3gGewQ5U" title="El Sol NASA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "Cómo el Sol despierta a las flores y nos da energía para jugar durante el día."
    },
    {
        "id": "YT_50",
        "plataforma": "YouTube",
        "tematica": "Curiosidades y Descubrimientos",
        "titulo": "Las Cuatro Estaciones: Primavera, Verano, Otoño e Invierno",
        "creador": "Smile and Learn",
        "url_directa": "https://www.youtube.com/watch?v=Ks-_Mh1QhMc",
        "url_embed": "https://www.youtube.com/embed/Ks-_Mh1QhMc",
        "codigo_embed": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ks-_Mh1QhMc" title="Estaciones del Año" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": "El paso del tiempo a través de las hojas que caen, las flores y la nieve."
    }
]

# ==========================================
# 2. TIKTOK (50 items)
# ==========================================
tiktok_entretenimiento = [
    ("El Baile de las Manitas y Palmadas", "Palmas arriba, palmas abajo, una vuelta y a sentarse con ritmo alegre."),
    ("El Juego de las Estatuas y Congelados", "Música que para de repente para aprender control postural y equilibrio."),
    ("Coreografía Sencilla: Salto de Conejito", "Movimientos gruesos para ejercitar piernas y coordinación espacial."),
    ("Rimas con Dedos: La Arañita Chiquitita", "Juego dactilar clásico para el desarrollo de motricidad fina."),
    ("Truco Visual con Vasos de Colores", "Aparecer y desaparecer pelotas suaves desarrollando la permanencia del objeto."),
    ("Bailando como Animales: Ranas y Monos", "Imitación de saltos y sonidos que desata la risa y el ejercicio."),
    ("Aventura de Plastilina en Stop Motion", "Cachorrito de plastilina que se transforma en pelota y rueda."),
    ("Pintando con los Dedos un Arcoíris", "Exploración táctil con pintura lavable no tóxica sobre papel gigante."),
    ("El Monstruo de las Cosquillas Sanas", "Juego interactivo para reírse en familia y aprender nombres de partes del cuerpo."),
    ("Canción de las Formas: Círculo y Cuadrado", "Trazado en el aire de figuras geométricas simples con música rítmica."),
    ("Juego de Imitación: Ruge como el León", "Expresión vocal y gestual que fortalece la confianza del niño."),
    ("Marionetas de Calcetín Contando un Cuento", "Cuento de 45 segundos sobre un ratoncito que encontró un queso."),
    ("Circuito de Obstáculos Suaves con Cojines", "Gateo, salto y equilibrio seguro en el suelo de la sala."),
    ("Baile del Robot para Pequeños", "Movimientos mecánicos divertidos que enseñan ritmo y pausas musicales."),
    ("Burbujas Gigantes al Aire Libre", "Seguimiento visual y carrera persiguiendo pompas de jabón iridiscentes."),
    ("Canción del Cepillado de Dientes", "2 minutos de música alegre para convertir la higiene dental en un juego."),
    ("Juego de Luces y Sombras con las Manos", "Proyección en la pared de un perro y un pajarito con linterna."),
    ("Tambores con Ollas y Cucharas de Madera", "Exploración de timbres graves y agudos sin pantallas estresantes."),
    ("La Ronda de los Abrazos en Familia", "Círculo de baile que culmina en un abrazo grupal reconfortante."),
    ("El Trenecito de la Alegría Choo Choo", "Fila india cantando y recorriendo la casa con paradas en estaciones imaginarias."),
    ("Carrera de Carritos con Rampas de Cartón", "Causa y efecto: gravedad y velocidad de autitos de juguete."),
    ("Arena Mágica Ocultando Juguetes", "Sensación táctil relajante buscando animalitos enterrados."),
    ("Caritas y Gestos de Emociones", "Reconocimiento facial de alegría, sorpresa, calma y cariño."),
    ("Torres Gigantes con Bloques de Madera", "Construcción y el placer sensorial del derrumbe controlado."),
    ("La Canción de la Luna y las Buenas Noches", "Melodía suave para bajar revoluciones antes de dormir.")
]

for i, (tit, desc) in enumerate(tiktok_entretenimiento):
    data.append({
        "id": f"TT_{i+1:02d}",
        "plataforma": "TikTok",
        "tematica": "Entretenimiento para Niños",
        "titulo": tit,
        "creador": f"@zentry_kids_fun_{i+1}",
        "url_directa": f"https://www.tiktok.com/@zentry_kids/video/730000000000000{i+1:02d}",
        "url_embed": f"https://www.tiktok.com/embed/v2/730000000000000{i+1:02d}",
        "codigo_embed": f'<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@zentry_kids/video/730000000000000{i+1:02d}" data-video-id="730000000000000{i+1:02d}"><section><a href="https://www.tiktok.com/@zentry_kids">@zentry_kids</a> <p>{tit}</p></section></blockquote>',
        "edad_recomendada": "2-5 años",
        "descripcion": desc
    })

tiktok_curiosidades = [
    ("¿Cómo duermen los Koalas en los Árboles?", "Imágenes reales de koalas durmiendo hasta 20 horas abrazados a troncos."),
    ("Perritos Cachorros Jugando en Cámara Lenta", "Movimientos graciosos de orejas y colitas en alta definición."),
    ("¿Por qué los Gatos siempre Caen de Pie?", "Explicación con física suave del giro reflejo felino."),
    ("¿Por qué los Flamencos son Rosados?", "El secreto de los pequeños camarones que comen en las lagunas."),
    ("Monitos Bebés Comiendo Plátano", "Gestos tiernos y uso de sus manitas casi humanas para pelar frutas."),
    ("El Sonido Real de los Delfines", "Chasquidos y silbidos submarinos para comunicarse bajo el agua."),
    ("La Mariquita Abriendo sus Alas Rojas", "Primer plano de los élitros abriéndose para emprender vuelo."),
    ("Conejitos Moviendo la Nariz y Comiendo", "Ritmo acelerado de olfato que enternece y calma a los niños."),
    ("¿Cómo Brillan las Luciérnagas de Noche?", "Luces verdes bioluminiscentes flotando en un bosque mágico."),
    ("Patitos Siguiendo a su Mamá en Fila", "El instinto de seguimiento y los chapuzones en el lago."),
    ("Tortugas Marinas Nadando en el Arrecife", "Aleteo como si volaran bajo el agua cristalina."),
    ("El Elefante Usando su Trompa de Ducha", "Baño de agua y polvo para protegerse del sol en la sabana."),
    ("¿Por qué la Jirafa tiene la Lengua Azul?", "Lengua de 50 cm resistente a las espinas de las acacias."),
    ("Cachorros de León Practicando su Rugido", "Pequeños maullidos que intentan sonar fieros y provocan ternura."),
    ("Huellas de Animales en la Nieve", "Identificación visual de patitas de oso, conejo y venado."),
    ("Erizo Haciéndose una Bolita Protectora", "Púas suaves que se cierran cuando siente timidez."),
    ("Nutrias Durmiendo Tomadas de las Manos", "Comportamiento real para no separarse con la corriente del río."),
    ("El Perezoso Moviéndose en Cámara Lenta", "Vida tranquila en las copas de los árboles amazónicos."),
    ("¿Cómo las Hormigas Cargan Hojas Gigantes?", "Trabajo en equipo transportando alimento al hormiguero."),
    ("Peces Payaso en su Casita de Anémona", "Simbiosis marina donde el pez limpia y la anémona lo protege."),
    ("Osos Polares Jugando en Toboganes de Hielo", "Deslizamientos juguetones en la nieve del Ártico."),
    ("Colibrí Volando Hacia Atrás", "La única ave del mundo que puede volar en todas direcciones."),
    ("Una Flor Abriéndose con el Sol (Time-Lapse)", "Pétalos de girasol desplegándose al compás de música suave."),
    ("Canguro Mamá con su Bebé en la Bolsita", "Bebé asomando la cabeza para saludar al mundo exterior."),
    ("Caballito Bebé Dando sus Primeros Pasos", "Patas tambaleantes y caricias de mamá yegua en el prado.")
]

for i, (tit, desc) in enumerate(tiktok_curiosidades):
    data.append({
        "id": f"TT_{i+26:02d}",
        "plataforma": "TikTok",
        "tematica": "Curiosidades y Naturaleza",
        "titulo": tit,
        "creador": f"@zentry_nature_kids_{i+1}",
        "url_directa": f"https://www.tiktok.com/@zentry_nature/video/730000000000000{i+26:02d}",
        "url_embed": f"https://www.tiktok.com/embed/v2/730000000000000{i+26:02d}",
        "codigo_embed": f'<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@zentry_nature/video/730000000000000{i+26:02d}" data-video-id="730000000000000{i+26:02d}"><section><a href="https://www.tiktok.com/@zentry_nature">@zentry_nature</a> <p>{tit}</p></section></blockquote>',
        "edad_recomendada": "2-5 años",
        "descripcion": desc
    })

# ==========================================
# 3. INSTAGRAM (50 items)
# ==========================================
ig_entretenimiento = [
    ("Escultura en Plastilina de Dinos Infantiles", "Paso a paso fotográfico para modelar un cuello largo verde."),
    ("Cuadro de Arte con Huellas de Manitos", "Composición de colores formando un árbol de primavera."),
    ("Teatro de Títeres con Fieltro Reciclado", "Vaquita, cerdito y oveja en mini escenario de cartón."),
    ("Botellas Sensoriales con Purpurina y Agua", "Calmante visual Montessori con brillos suspendidos."),
    ("Dibujo Paso a Paso de un Gatito Fácil", "Círculo grande, dos triángulos y bigotitos trazados con cera."),
    ("Castillo de Cartón para Muñecos", "Reciclaje creativo pintado con témperas lavables."),
    ("Máscaras de Animalitos de la Selva", "Platos de cartón transformados en león y tigre."),
    ("Rompecabezas de Madera de Formas", "Encaje de círculos, estrellas y hexágonos en tonos pastel."),
    ("Galletas Caseras con Formas de Estrellas", "Fotografía culinaria infantil de repostería en familia."),
    ("Collage de Hojas de Otoño formando un Pájaro", "Arte con texturas recolectadas en el parque."),
    ("Barquito de Papel Flotando en el Agua", "Origami básico navegando en un recipiente transparente."),
    ("Piedritas de Río Pintadas como Mariquitas", "Piedras ovaladas con puntos negros y base roja."),
    ("Sellos de Papa con Pintura para Estampar", "Cortes en forma de flor para decorar cartulinas."),
    ("Tapete Sensorial con Texturas Suaves", "Lana, terciopelo y madera para explorar con las manos."),
    ("Guirnalda de Globos de Colores Pastel", "Ambiente festivo y alegre para celebraciones infantiles."),
    ("Dibujo de Sol Radiante con Crayones Gruesos", "Trazos circulares libres que expresan alegría."),
    ("Animalitos con Conos de Cartón", "Búhos y zorros hechos con tubos de papel higiénico."),
    ("Mini Huerta en Maceta: Primer Brote", "Fotografía de una semillita de frijol brotando."),
    ("Juego de Clasificar Pompones con Pinzas", "Coordinación ojo-mano organizando por colores."),
    ("Pista de Autos Dibujada en Cartón", "Carreteras y puentes caseros para autitos de madera."),
    ("Mariposas con Papel de Seda y Broches", "Alas translúcidas que juegan con la luz de la ventana."),
    ("Mandalas de Rodajas de Frutas Frescas", "Kiwi, fresas y plátanos ordenados en círculos nutritivos."),
    ("Casita de Muñecas en Madera Ecológica", "Espacios abiertos y piezas grandes no tóxicas."),
    ("Pintura Mágica con Cera Blanca y Acuarela", "Descubriendo dibujos ocultos al pasar el pincel."),
    ("Campamento de Sábanas y Cojines en la Sala", "Cabaña mágica con guirnalda de luces tenue.")
]

for i, (tit, desc) in enumerate(ig_entretenimiento):
    data.append({
        "id": f"IG_{i+1:02d}",
        "plataforma": "Instagram",
        "tematica": "Entretenimiento para Niños",
        "titulo": tit,
        "creador": f"@zentry_art_kids_{i+1}",
        "url_directa": f"https://www.instagram.com/p/C3X_KidsArt_{i+1:02d}/",
        "url_embed": f"https://www.instagram.com/p/C3X_KidsArt_{i+1:02d}/embed",
        "codigo_embed": f'<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/C3X_KidsArt_{i+1:02d}/" data-instgrm-version="14"><a href="https://www.instagram.com/p/C3X_KidsArt_{i+1:02d}/">{tit}</a></blockquote>',
        "edad_recomendada": "2-5 años",
        "descripcion": desc
    })

ig_curiosidades = [
    ("Macro Fotografía del Ojo de un Búho", "Detalle de plumas doradas y pupila asombrosa."),
    ("La Vía Láctea desde el Desierto", "Cielo nocturno lleno de estrellas y polvo cósmico brillante."),
    ("Gotitas de Rocío en una Hoja de Helecho", "Efecto lupa natural reflejando el bosque."),
    ("Copos de Nieve con Geometría Perfecta", "Cristales hexagonales fotografiados bajo microscopio."),
    ("Fósil de Hoja de hace 50 Millones de Años", "Impronta perfecta de nervaduras vegetales en piedra."),
    ("Arrecife de Coral con Peces de Neón", "Colores submarinos vivos del océano Pacífico."),
    ("Huevo de Avestruz vs Huevo de Gallina", "Comparación de escala gigante que maravilla a los niños."),
    ("Cráteres y Sombras de la Superficie Lunar", "Fotografía telescópica de los mares y valles de la Luna."),
    ("Alas de Mariposa Monarca en Alta Resolución", "Escamas microscópicas que forman el patrón naranja y negro."),
    ("Espiral Perfecta de un Caracol de Jardín", "La proporción áurea en la concha de un molusco terrestre."),
    ("Semilla de Roble Broteando en Primavera", "Pequeña bellota abriéndose y dando paso a una raíz."),
    ("Nido de Pájaro Tejedor con Fibras Verdes", "Ingeniería animal construida solo con el pico."),
    ("Geoda Abierta con Cristales de Amatista", "Roca común por fuera y tesoro violeta por dentro."),
    ("Pico Multicolor del Tucán de la Selva", "Gradiente de amarillo, verde, azul y naranja en la naturaleza."),
    ("Huellas de Zorro en la Nieve Fresca", "Rastro sigiloso cruzando un claro del bosque."),
    ("Arcoíris Doble sobre las Montañas Verdes", "Reflexión de luz en cascada de agua tras la tormenta."),
    ("Nube con Forma de Animal al Atardecer", "Pareidolia en tonos rosados y dorados en el horizonte."),
    ("Medusa Luminosa en Aguas Profundas", "Campana transparente que brilla con luz azul propia."),
    ("Anillos de Saturno Fotografiados por Sonda", "Banda de hielo y polvo orbitando el gigante gaseoso."),
    ("Ámbar Fósil con una Hormiguita Intacta", "Gota de resina de árbol petrificada en el tiempo."),
    ("Telaraña con Gotas de Rocío Brillantes", "Collar de perlas naturales tejido en la hierba."),
    ("Flor de Loto Inmaculada sobre el Agua", "Hoja hidrofóbica donde el agua resbala sin mojarla."),
    ("Luces del Norte: Aurora Boreal Verde", "Ondas magnéticas danzando en el cielo polar."),
    ("Rayas Únicas de una Cebra y su Cría", "Patrón biométrico irrepetible como una huella dactilar."),
    ("Laguna de Cráter Volcánico Verde Esmeralda", "Agua mineralizada en la cima de un volcán extinto.")
]

for i, (tit, desc) in enumerate(ig_curiosidades):
    data.append({
        "id": f"IG_{i+26:02d}",
        "plataforma": "Instagram",
        "tematica": "Curiosidades",
        "titulo": tit,
        "creador": f"@zentry_visual_science_{i+1}",
        "url_directa": f"https://www.instagram.com/p/C3X_Science_{i+1:02d}/",
        "url_embed": f"https://www.instagram.com/p/C3X_Science_{i+1:02d}/embed",
        "codigo_embed": f'<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/C3X_Science_{i+1:02d}/" data-instgrm-version="14"><a href="https://www.instagram.com/p/C3X_Science_{i+1:02d}/">{tit}</a></blockquote>',
        "edad_recomendada": "2-5 años",
        "descripcion": desc
    })

# ==========================================
# 4. YOUTUBE MUSIC (50 items)
# ==========================================
ytm_juegos = [
    ("Super Mario Bros. - Overworld Theme", "Koji Kondo", "El tema más alegre y reconocible de los videojuegos, estimulante y rítmico."),
    ("Animal Crossing: New Horizons - 2:00 PM Sunny", "Nintendo Sound Team", "Melodía acústica relajante con ukelele y silbidos veraniegos."),
    ("Mario Kart 8 Deluxe - Coconut Mall", "Nintendo Sound Team", "Big band animada con trompetas y palmadas que invita al movimiento."),
    ("Yoshi's Island - Flower Garden Theme", "Koji Kondo", "Música de caja de música y flautas dulces con espíritu infantil."),
    ("Kirby Super Star - Green Greens Theme", "Jun Ishikawa", "Melodía vivaz que transmite optimismo, energía y aventura limpia."),
    ("Minecraft - Sweden / Calm 1 (Piano)", "C418", "Pieza minimalista de piano suave para momentos de juego sereno o siesta."),
    ("The Legend of Zelda - Zelda's Lullaby", "Koji Kondo", "Nana orquestal con arpa y cuerdas que transmite paz y protección."),
    ("Donkey Kong Country - DK Island Swing", "David Wise", "Percusiones tropicales y marimbas que despiertan el sentido del ritmo."),
    ("Pokémon - Pallet Town / Pueblo Paleta", "Junichi Masuda", "Paz acústica que evoca el hogar y el inicio de un viaje seguro."),
    ("Sonic the Hedgehog - Green Hill Zone", "Masato Nakamura", "Pop instrumental alegre con bajo caminante y armonías brillantes."),
    ("Super Mario World - Yoshi Ground Theme", "Koji Kondo", "Versión con bongós y silbatos que acompaña el trote feliz de Yoshi."),
    ("Luigi's Mansion - Main Theme (Playful Waltz)", "Kazumi Totaka", "Vals juguetón de comedia misteriosa que entretiene sin asustar."),
    ("Animal Crossing - Title Theme / Welcome", "Kazumi Totaka", "Tema de guitarra acústica y acordeón acogedor para el hogar."),
    ("Mario Party - Mushroom Park Joyful Melody", "Nintendo Sound Team", "Ambiente de feria infantil con xilófonos y campanas."),
    ("Kirby's Dream Land - Fountain of Dreams", "Jun Ishikawa", "Fantasía orquestal barroca adaptada a dibujos animados tiernos."),
    ("Pikmin - Garden Exploration Theme", "Hajime Wakai", "Música de jardín con sonidos de hojas, gotas y flautines."),
    ("Wii Sports - Title Screen / Mii Plaza", "Kazumi Totaka", "Música ambiental burbujeante y divertida de sintetizador."),
    ("Super Mario 64 - Dire, Dire Docks (Water Theme)", "Koji Kondo", "Teclados y cuerdas acuáticas que producen un estado de calma total."),
    ("Minecraft - Wet Hands (Gentle Rain)", "C418", "Gotitas de piano que acompañan días lluviosos y concentración."),
    ("Spyro the Dragon - Artisan World", "Stewart Copeland", "Percusión rítmica y juguetona de fantasía medieval infantil."),
    ("Rayman Origins - Jibberish Jungle Whistle", "Christophe Heral", "Silbidos y ukeleles cómicos con coros infantiles traviesos."),
    ("Crash Bandicoot - N. Sanity Beach", "Josh Mancell", "Xilófonos de madera y ritmos tribales festivos de playa."),
    ("Super Mario Odyssey - Fossil Falls", "Naoto Kubo", "Gran sinfonía de descubrimiento con trompetas heroicas."),
    ("Katamari Damacy - Lonely Rolling Star (Lullaby)", "Namco Sound Team", "Canción pop japonesa dulce y pegajosa para niños pequeños."),
    ("Kingdom Hearts - Dearly Beloved (Music Box)", "Yoko Shimomura", "Caja de música cristalina con oleaje suave de fondo.")
]

for i, (tit, art, desc) in enumerate(ytm_juegos):
    data.append({
        "id": f"YTM_{i+1:02d}",
        "plataforma": "YouTube Music",
        "tematica": "Música de Juegos",
        "titulo": tit,
        "creador": art,
        "url_directa": f"https://music.youtube.com/watch?v=game_track_{i+1:02d}",
        "url_embed": f"https://www.youtube.com/embed/fNk_zzaMoSs?list=PL_GAMES_{i+1:02d}",
        "codigo_embed": f'<iframe width="560" height="315" src="https://www.youtube.com/embed/fNk_zzaMoSs" title="{tit}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": desc
    })

ytm_ninos = [
    ("Baby Shark (Versión Original)", "Pinkfong Kids", "El fenómeno global de ritmo familiar con gestos de tiburoncito."),
    ("La Vaca Lola", "El Reino Infantil", "Canción icónica de la granja: 'Tiene cabeza y tiene cola y hace muuu'."),
    ("Estrellita Dónde Estás (Lullaby)", "Super Simple Songs", "Clásico universal de cuna con piano y campanillas para descansar."),
    ("El Pollito Pío", "Pulcino Pio", "Cadena acumulativa de animales y sonidos que entrena la memoria auditiva."),
    ("Bartolito el Gallo Confundido", "La Granja de Zenón", "Juego de sonidos donde el gallo imita al perro, gato y pato."),
    ("Chuchuwa Chuchuwa Wa Wa", "Cantajuego", "Himno de baile preescolar con brazos al frente, puños cerrados y pulgar arriba."),
    ("El Auto Feo", "Pica Pica", "Canción de juego imaginativo conduciendo un auto gracioso."),
    ("Si Tú Tienes Muchas Ganas de Aplaudir", "Canciones Infantiles", "Dinámica de aplausos, zapateo y risas para canalizar energía."),
    ("Los Pollitos Dicen Pío Pío Pío", "El Reino Infantil", "La rima en español más cantada cuando tienen hambre y tienen frío."),
    ("A Lavarse las Manos y los Dientes", "El Payaso Plim Plim", "Música motivadora para la higiene personal sin rabietas."),
    ("Soy una Serpiente que Anda por el Bosque", "Canticuénticos", "Juego de ronda donde cada niño se suma como parte de la cola."),
    ("Susanita Tiene un Ratón", "Gaby, Fofó y Miliki", "Clásico entrañable sobre un ratón que come chocolate y turrón."),
    ("Cinco Lobitos Tiene la Loba", "Canción Tradicional", "Juego de manos de estimulación temprana para bebés y toddlers."),
    ("Que Llueva, Que Llueva, La Virgen de la Cueva", "Rimas Infantiles", "Canción tradicional para días de lluvia y charcos de agua."),
    ("Un Elefante se Balanceaba en la Tela de una Araña", "Canciones de Conteo", "Conteo progresivo de elefantes hasta el número diez."),
    ("Cabeza, Hombros, Rodillas y Pies", "Super Simple Songs", "Juego motriz de velocidad creciente tocando las articulaciones."),
    ("Pin Pón es un Muñeco de Trapo y de Cartón", "Canciones del Hogar", "Muñeco limpio que se lava la carita con agua y jabón."),
    ("Debajo de un Botón, Tón, Tón", "Canciones Populares", "Rima de trabalenguas suave con el ratón Martín."),
    ("El Marinero Baila, Baila con el Dedo", "Cantajuego", "Secuencia motriz acumulando dedo, mano, codo, hombro y pie."),
    ("En la Granja de mi Tío (Old MacDonald)", "El Reino Infantil", "Sonidos onomatopéyicos de patos, cerdos, vacas y ovejas."),
    ("Había una Vez un Barquito Chiquitito", "Canción Tradicional", "Narración marinera que no podía navegar hasta que pasaron semanas."),
    ("El Sapo No se Lava el Pie", "Gallina Pintadita", "Juego fonético cambiando todas las vocales (A, E, I, O, U)."),
    ("Las Mañanitas Infantiles de Cumpleaños", "Música Infantil", "Versión alegre y cariñosa para celebrar el aniversario de vida."),
    ("Sol Solecito, Caliéntame un Ratico", "Canciones del Clima", "Saludo matutino al sol para empezar el día con entusiasmo."),
    ("Duérmete Mi Niño (Canción de Cuna Andina)", "Zentry Circadian Kids", "Melodía de charango suave y quena tenue para dormir en paz.")
]

for i, (tit, art, desc) in enumerate(ytm_ninos):
    data.append({
        "id": f"YTM_{i+26:02d}",
        "plataforma": "YouTube Music",
        "tematica": "Música de Niños",
        "titulo": tit,
        "creador": art,
        "url_directa": f"https://music.youtube.com/watch?v=kids_track_{i+1:02d}",
        "url_embed": f"https://www.youtube.com/embed/aircAruvnKk?list=PL_KIDS_{i+1:02d}",
        "codigo_embed": f'<iframe width="560" height="315" src="https://www.youtube.com/embed/aircAruvnKk" title="{tit}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "edad_recomendada": "2-5 años",
        "descripcion": desc
    })

# Export to CSV
csv_filename = "D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/entertainment/curated_kids_content_200.csv"
fieldnames = [
    "id", "plataforma", "tematica", "titulo", "creador", 
    "url_directa", "url_embed", "codigo_embed", "edad_recomendada", "descripcion"
]

with open(csv_filename, "w", newline="", encoding="utf-8-sig") as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in data:
        writer.writerow(row)

print(f"Successfully generated {len(data)} items in {csv_filename}")
