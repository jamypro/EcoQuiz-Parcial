// config.js
const CONFIG = {
    TIEMPO_PREGUNTA: 90, // segundos por pregunta
    MIN_PREGUNTAS: 5,
    MAX_PREGUNTAS: 20,
    MIN_JUGADORES: 1,
    MAX_JUGADORES: 5,
    NIVELES_DIFICULTAD: ["baja", "media", "alta", "extrema"],
    MODOS_JUEGO: {
        TURNEADO: "turneado",
        INTERCALADO: "intercalado",
    },
    ARCHIVOS_PREGUNTAS: [
        "data/Reciclaje.json",
        "data/Cambio_Climatico.json",
        "data/Energias_Renovables.json",
        "data/Sostenibilidad_Ambiental.json",
        "data/Preguntas_Sostenibilidad.json",
    ],
    SONIDOS: {
        CAMBIO_PREGUNTA: "assets/sonidos/cambiarpregunta.mp3",
        FINAL_JUEGO: "assets/sonidos/final.mp3",
        ACIERTO: "assets/sonidos/correct.mp3",
        ERROR: "assets/sonidos/error.mp3",
    },
};

export default CONFIG;
