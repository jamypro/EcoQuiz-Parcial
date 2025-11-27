// jugadores.js
class ManejadorJugadores {
    constructor() {
        this.jugadores = [];
        this.jugadorActual = 0;
    }

    agregarJugador(nombre) {
        this.jugadores.push({
            nombre: nombre,
            aciertos: 0,
            fallos: 0,
            preguntas: [],
            respuestas: [],
            preguntasRespondidas: 0, // Nuevo: contador por jugador
        });
    }

    obtenerJugadorActual() {
        return this.jugadores[this.jugadorActual];
    }

    siguienteJugador() {
        this.jugadorActual = (this.jugadorActual + 1) % this.jugadores.length;
        return this.obtenerJugadorActual();
    }

    registrarRespuesta(
        jugadorIndex,
        pregunta,
        esCorrecta,
        respuestaUsuario
    ) {
        const jugador = this.jugadores[jugadorIndex];
        if (esCorrecta) {
            jugador.aciertos++;
        } else {
            jugador.fallos++;
        }
        jugador.respuestas.push({ pregunta, esCorrecta, respuestaUsuario });
    }

    asignarPreguntasAJugador(jugadorIndex, preguntas) {
        this.jugadores[jugadorIndex].preguntas = preguntas;
    }

    obtenerResultados() {
        return this.jugadores
            .map((jugador) => {
                const aciertos = jugador.respuestas.filter(
                    (r) => r.esCorrecta
                ).length;
                const fallos = jugador.respuestas.length - aciertos;
                return {
                    nombre: jugador.nombre,
                    aciertos,
                    fallos,
                    puntaje: aciertos * 100,
                };
            })
            .sort((a, b) => b.puntaje - a.puntaje);
    }

    reiniciar() {
        this.jugadores = [];
        this.jugadorActual = 0;
    }
}

export default ManejadorJugadores;
