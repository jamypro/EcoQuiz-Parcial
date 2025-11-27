class InterfazUI {
    constructor() {
        // Pantallas
        this.pantallaInicio = document.getElementById("pantalla-inicio");
        this.pantallaJuego = document.getElementById("pantalla-juego");
        this.pantallaResultados = document.getElementById(
            "pantalla-resultados"
        );

        // Elementos del formulario
        this.formConfiguracion = document.getElementById("configuracion-juego");
        this.inputNombreJugador = document.getElementById("nombre-jugador");
        this.inputNumPreguntas = document.getElementById("num-preguntas");
        this.selectDificultad = document.getElementById("dificultad");

        // Elementos del juego
        this.jugadorActual = document.getElementById("jugador-actual");
        this.temporizador = document.getElementById("temporizador");
        this.barraProgreso = document.getElementById("barra-progreso");
        this.contenedorPregunta = document.getElementById(
            "contenedor-pregunta"
        );
        this.preguntaActual = document.getElementById("pregunta-actual");
        this.opcionesContainer = document.getElementById("opciones");

        // Elementos de resultados
        this.podio = document.getElementById("podio");
        this.tablaResultados = document.getElementById("tabla-resultados");
        this.recomendaciones = document.getElementById("recomendaciones");
        this.btnJugarNuevo = document.getElementById("jugar-nuevo");
        this.btnVerRespuestas = document.getElementById("ver-respuestas");
        this.btnVolverInicio = document.getElementById("volver-inicio");

        this.inicializarEventos();
    }

    inicializarEventos() {
        this.btnVerRespuestas.addEventListener("click", () => {
            this.dispatchEvent("verRespuestas");
        });
        this.formConfiguracion.addEventListener("submit", (e) => {
            e.preventDefault();
            const config = this.obtenerConfiguracion();
            if (config) {
                this.dispatchEvent("iniciarJuego", config);
            }
        });
    }

    obtenerConfiguracion() {
        const Nombre = this.inputNombreJugador.value.trim();
        if (!Nombre) {
            alert("Por favor, ingresa tu nombre.");
            return null;
        }

        return {
            jugadores: [Nombre], // Se envía como un array para mantener la estructura
            numPreguntas: parseInt(this.inputNumPreguntas.value),
            dificultad: this.selectDificultad.value,
            modoJuego: "turneado", // Modo de juego único
        };
    }

    mostrarPantalla(pantalla) {
        [
            this.pantallaInicio,
            this.pantallaJuego,
            this.pantallaResultados,
        ].forEach((p) => {
            p.classList.add("d-none");
        });
        pantalla.classList.remove("d-none");
    }

    mostrarPregunta(pregunta, jugador) {
        this.jugadorActual.textContent = `Jugador: ${jugador}`;

        // Manejar el contexto si existe (mostrar multilínea, escapar HTML y convertir saltos de línea)
        const contextoElement = document.getElementById("contexto-pregunta");
        const escapeHtml = (str) =>
            String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        const formatMultiline = (text) =>
            escapeHtml(text).replace(/\n+/g, "<br><br>");

        if (pregunta.contexto && String(pregunta.contexto).trim().length > 0) {
            contextoElement.innerHTML = formatMultiline(pregunta.contexto);
            contextoElement.classList.remove("d-none");
        } else {
            contextoElement.classList.add("d-none");
        }

        // Pregunta
        this.preguntaActual.innerHTML = formatMultiline(pregunta.texto);

        // Opciones
        this.opcionesContainer.innerHTML = "";
        pregunta.opciones.forEach((opcion, index) => {
            const button = document.createElement("button");
            button.className = "btn btn-outline-success opcion-respuesta mb-2";
            button.innerHTML = escapeHtml(opcion);
            button.dataset.index = index;
            this.opcionesContainer.appendChild(button);
        });
    }

    actualizarTemporizador(tiempo) {
        this.temporizador.textContent = tiempo;
    }

    actualizarBarraProgreso(porcentaje) {
        this.barraProgreso.style.width = `${porcentaje}%`;
    }

    mostrarPreguntascorrectas() {}

    mostrarResultados(resultados) {
        // Crear podio
        this.podio.innerHTML = this.crearPodioHTML(resultados.slice(0, 1));

        // Llenar tabla de resultados
        this.tablaResultados.innerHTML = resultados
            .map(
                (jugador, index) => `
            <tr>
                <td>${index + 1}°</td>
                <td>${jugador.nombre}</td>
                <td>${jugador.aciertos}</td>
                <td>${jugador.fallos}</td>
                <td>${jugador.puntaje}</td>
            </tr>
        `
            )
            .join("");

        // Mostrar recomendaciones
        this.mostrarRecomendaciones(resultados);

        // Mostrar pantalla de resultados
        this.mostrarPantalla(this.pantallaResultados);
        this.animarConfeti();
    }

    crearPodioHTML(top1) {
        if (!top1 || top1.length === 0) return "";
        const jugador = top1[0];
        return `
            <div class="podio-lugar podio-1">
                <div class="medalla">🏆</div>
                <div class="nombre">${jugador.nombre}</div>
                <div class="puntaje">${jugador.puntaje} pts</div>
            </div>
        `;
    }

    mostrarRecomendaciones(resultados) {
        const recomendaciones = [
            "¡Excelente trabajo! Sigue aprendiendo sobre el medio ambiente.",
            "Recuerda que cada pequeña acción cuenta para cuidar nuestro planeta.",
            "Comparte estos conocimientos con amigos y familia.",
        ];

        this.recomendaciones.innerHTML = recomendaciones.join("<br>");
    }

    animarConfeti() {
        for (let i = 0; i < 50; i++) {
            const confeti = document.createElement("div");
            confeti.className = "confeti confeti-animation";
            confeti.style.left = `${Math.random() * 100}vw`;
            confeti.style.animationDelay = `${Math.random() * 3}s`;
            confeti.style.backgroundColor = `hsl(${
                Math.random() * 360
            }, 100%, 50%)`;
            document.body.appendChild(confeti);

            setTimeout(() => confeti.remove(), 4000);
        }
    }

    mostrarModalRespuestas(jugadores) {
        const contenidoModal = document.getElementById(
            "contenido-modal-respuestas"
        );
        contenidoModal.innerHTML = ""; // Limpiar contenido anterior

        // Mostrar directamente para un solo jugador
        contenidoModal.innerHTML = this.generarHtmlRespuestas(jugadores[0]);

        const modal = new bootstrap.Modal(
            document.getElementById("modal-respuestas")
        );
        modal.show();
    }

    generarHtmlRespuestas(jugador) {
        if (!jugador || !jugador.respuestas) return "";

        return jugador.respuestas
            .map((respuesta) => {
                const pregunta = respuesta.pregunta;
                const esAcertada = respuesta.esCorrecta;
                const icono = esAcertada
                    ? '<span class="resultado-icono">✅</span>'
                    : '<span class="resultado-icono">❌</span>';
                const claseItem = esAcertada ? "acertada" : "fallada";

                return `
                <div class="pregunta-item ${claseItem}">
                    <p class="pregunta-texto">${icono} ${pregunta.texto}</p>
                    <p><strong>Respuesta correcta:</strong> <span class="respuesta-correcta">
                        ${pregunta.opciones[pregunta.respuestaCorrecta]}
                    </span></p>
                    <p><strong>Tu respuesta:</strong> <span class="respuesta-usuario ${claseItem}">${
                    respuesta.respuestaUsuario
                }</span></p>
                </div>
            `;
            })
            .join("");
    }

    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
}

export default InterfazUI;
