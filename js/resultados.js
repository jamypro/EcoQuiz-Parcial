// resultados.js
class ManejadorResultados {
    constructor() {
        this.resultados = [];
    }

    agregarResultado(jugador, aciertos, fallos) {
        this.resultados.push({
            nombre: jugador,
            aciertos: aciertos,
            fallos: fallos,
            puntaje: this.calcularPuntaje(aciertos, fallos),
        });
    }

    calcularPuntaje(aciertos, fallos) {
        return aciertos * 100; // Puedes ajustar la fórmula según necesites
    }

    obtenerPodio() {
        return [...this.resultados]
            .sort((a, b) => b.puntaje - a.puntaje)
            .slice(0, 3);
    }

    obtenerTodosResultados() {
        return [...this.resultados].sort((a, b) => b.puntaje - a.puntaje);
    }

    generarRecomendaciones(resultados) {
        const recomendaciones = [
            "¡Sigue aprendiendo sobre el medio ambiente!",
            "Comparte estos conocimientos con tus amigos y familia.",
            "Recuerda que cada pequeña acción cuenta para cuidar nuestro planeta.",
        ];

        // Aquí podrías agregar lógica para personalizar las recomendaciones
        // basándote en el rendimiento del jugador

        return recomendaciones;
    }

    limpiarResultados() {
        this.resultados = [];
    }
}

export default ManejadorResultados;
