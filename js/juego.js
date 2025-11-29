// juego.js
import CONFIG from "./config.js";
import ManejadorPreguntas from "./preguntas.js";
import ManejadorJugadores from "./jugadores.js";
import Temporizador from "./temporizador.js";
import InterfazUI from "./interfaz.js";

class Juego {
    constructor() {
        this.manejadorPreguntas = new ManejadorPreguntas();
        this.manejadorJugadores = new ManejadorJugadores();
        this.interfaz = new InterfazUI();
        this.temporizador = null;
        this.configuracion = null;
        this.preguntaActual = null;
        this.totalPreguntas = 0;
        this.preguntasRespondidas = 0;
        this.tiempoInicio = null; // Para medir el tiempo total

        this.inicializarEventos();
    }

    async inicializarEventos() {
        window.addEventListener("iniciarJuego", async (e) => {
            this.configuracion = e.detail;
            await this.iniciarJuego();
        });

        document.getElementById("opciones").addEventListener("click", (e) => {
            if (e.target.classList.contains("opcion-respuesta")) {
                this.manejarRespuesta(parseInt(e.target.dataset.index));
            }
        });

        document.getElementById("jugar-nuevo").addEventListener("click", () => {
            this.reiniciarJuego();
        });

        document
            .getElementById("volver-inicio")
            .addEventListener("click", () => {
                this.volverAlInicio();
            });
        window.addEventListener("verRespuestas", () => {
            this.interfaz.mostrarModalRespuestas(
                this.manejadorJugadores.jugadores
            );
        });
    }

    async iniciarJuego() {
        // Registrar jugador en Firebase
        try {
            const registro = {
                Nombre: this.configuracion.jugadores[0],
                fechaRegistro: new Date(),
            };
            await window.addDoc(
                window.collection(window.db, "registros"),
                registro
            );
            console.log("Jugador registrado en Firebase:", registro);
        } catch (error) {
            console.error("Error al registrar jugador en Firebase:", error);
            alert("Error al registrar, intentelo de nuevo");
        }

        this.tiempoInicio = new Date(); // Guardar tiempo de inicio

        // Cargar preguntas
        const cargaExitosa = await this.manejadorPreguntas.cargarPreguntas();
        if (!cargaExitosa) {
            alert(
                "Error al cargar las preguntas. Por favor, intenta de nuevo."
            );
            return;
        }

        // Configurar jugadores
        this.configurarJugadores();

        // Configurar temporizador
        this.configurarTemporizador();

        // Mostrar primera pregunta
        this.interfaz.mostrarPantalla(
            document.getElementById("pantalla-juego")
        );
        this.mostrarSiguientePregunta();
    }

    configurarJugadores() {
        this.configuracion.jugadores.forEach((nombre) => {
            this.manejadorJugadores.agregarJugador(nombre);
        });

        // Asignar preguntas a cada jugador
        const preguntasDisponibles =
            this.manejadorPreguntas.filtrarPreguntasPorDificultad(
                this.configuracion.dificultad
            );

        if (!preguntasDisponibles || preguntasDisponibles.length === 0) {
            console.error(
                "No hay preguntas disponibles para la dificultad:",
                this.configuracion.dificultad
            );
            alert(
                "Error: No hay preguntas disponibles para el nivel de dificultad seleccionado"
            );
            return false;
        }

        const preguntasJugador =
            this.manejadorPreguntas.obtenerPreguntasParaJugador(
                this.configuracion.dificultad,
                this.configuracion.numPreguntas,
                [] // No es necesario excluir IDs para un solo jugador
            );

        if (!preguntasJugador || preguntasJugador.length === 0) {
            console.error("No se pudieron asignar preguntas al jugador.");
            return false;
        }

        this.manejadorJugadores.asignarPreguntasAJugador(0, preguntasJugador);
        this.totalPreguntas = this.configuracion.numPreguntas;
        return true;
    }

    configurarTemporizador() {
        const tiempoTotal = this.totalPreguntas * CONFIG.TIEMPO_PREGUNTA;

        this.temporizador = new Temporizador(
            tiempoTotal,
            (tiempoRestante) => {
                this.interfaz.actualizarTemporizador(
                    this.temporizador.obtenerTiempoFormateado()
                );
                this.interfaz.actualizarBarraProgreso(
                    this.temporizador.obtenerPorcentajeRestante()
                );
            },
            () => this.finalizarJuego()
        );

        this.temporizador.iniciar();
    }

    mostrarSiguientePregunta() {
        if (this.preguntasRespondidas >= this.totalPreguntas) {
            this.finalizarJuego();
            return;
        }

        const jugadorActual = this.manejadorJugadores.obtenerJugadorActual();
        const preguntaIndex = jugadorActual.preguntasRespondidas;

        this.preguntaActual = jugadorActual.preguntas[preguntaIndex];

        if (!this.preguntaActual) {
            console.error("Error: No se pudo obtener la pregunta actual.");
            this.finalizarJuego();
            return;
        }

        this.interfaz.mostrarPregunta(
            this.preguntaActual,
            jugadorActual.nombre
        );
        this.reproducirSonido("CAMBIO_PREGUNTA");
    }

    manejarRespuesta(indiceRespuesta) {
        const jugadorActual = this.manejadorJugadores.obtenerJugadorActual();
        const esCorrecta = this.manejadorPreguntas.verificarRespuesta(
            this.preguntaActual.id,
            indiceRespuesta
        );

        jugadorActual.preguntasRespondidas++;

        this.manejadorJugadores.registrarRespuesta(
            this.manejadorJugadores.jugadorActual,
            this.preguntaActual,
            esCorrecta,
            this.preguntaActual.opciones[indiceRespuesta]
        );

        this.preguntasRespondidas++;

        if (this.preguntasRespondidas < this.totalPreguntas) {
            this.mostrarSiguientePregunta();
        } else {
            this.finalizarJuego();
        }
    }

    async finalizarJuego() {
        this.temporizador.detener();
        this.reproducirSonido("FINAL_JUEGO");

        const resultados = this.manejadorJugadores.obtenerResultados();
        this.interfaz.mostrarResultados(resultados);

        // Guardar resultados en Firebase
        try {
            const jugadorResumen = resultados[0];
            const jugadorCompleto = this.manejadorJugadores.jugadores[0]; // Obtener el objeto completo del jugador
            const tiempoTotal = Math.round(
                (new Date() - this.tiempoInicio) / 1000
            );

            const resultadoPartida = {
                nombre: jugadorResumen.nombre,
                tiempoTotal: tiempoTotal,
                puntaje: jugadorResumen.puntaje,
                aciertos: jugadorResumen.aciertos,
                fallos: jugadorResumen.fallos,
                fechaFinalizacion: new Date(),
                preguntas: jugadorCompleto.respuestas.map((r) => ({
                    pregunta: r.pregunta.texto,
                    opciones: r.pregunta.opciones,
                    respuestaCorrecta:
                        r.pregunta.opciones[r.pregunta.respuestaCorrecta],
                    respuestaJugador: r.respuestaUsuario,
                    correcta: r.esCorrecta,
                })),
            };

            await window.addDoc(
                window.collection(window.db, "resultados"),
                resultadoPartida
            );
            console.log("Resultados guardados en Firebase:", resultadoPartida);
        } catch (error) {
            console.error("Error al guardar resultados en Firebase:", error);
        }
    }

    reiniciarJuego() {
        this.manejadorJugadores.reiniciar();
        this.preguntasRespondidas = 0;
        this.tiempoInicio = null;
        this.interfaz.mostrarPantalla(
            document.getElementById("pantalla-inicio")
        );
    }

    volverAlInicio() {
        this.reiniciarJuego();
    }

    reproducirSonido(tipo) {
        const audio = new Audio(CONFIG.SONIDOS[tipo]);
        audio
            .play()
            .catch((error) =>
                console.log("Error al reproducir sonido:", error)
            );
    }
}

export default Juego;
