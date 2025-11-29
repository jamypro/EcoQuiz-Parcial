// preguntas.js
import CONFIG from "./config.js";

class ManejadorPreguntas {
    constructor() {
        this.preguntas = [];
        this.preguntaActual = 0;
        this.preguntasSeleccionadas = [];
    }

    limpiarTexto(texto) {
        if (!texto) return "";
        // Eliminar cualquier [cite:XXXX]
        return texto.replace(/\[cite:\s*\d+\]/g, "").trim();
    }

    async cargarPreguntas() {
        try {
            const resultadosPorArchivo = await Promise.all(
                CONFIG.ARCHIVOS_PREGUNTAS.map(async (archivo) => {
                    const response = await fetch(archivo);
                    const data = await response.json();
                    const nombreArchivo = archivo
                        .split("/")
                        .pop()
                        .replace(".json", "");

                    // Procesar la estructura específica del JSON
                    const preguntas = [];

                    if (data.temas && Array.isArray(data.temas)) {
                        data.temas.forEach((tema) => {
                            if (tema.niveles && Array.isArray(tema.niveles)) {
                                tema.niveles.forEach((nivel) => {
                                    if (
                                        nivel.preguntas &&
                                        Array.isArray(nivel.preguntas)
                                    ) {
                                        // Mapear las preguntas al formato que espera la aplicación
                                        const preguntasProcesadas =
                                            nivel.preguntas.map((p) => {
                                                const rawPregunta =
                                                    p.pregunta || "";
                                                let contexto =
                                                    p.contexto || null;
                                                let preguntaTexto = rawPregunta;

                                                // 1. Extraer pregunta principal (texto entre ¿ y ?) si existe
                                                const qMatch =
                                                    preguntaTexto.match(
                                                        /(¿[\s\S]*?\?)/
                                                    );
                                                if (qMatch && qMatch[1]) {
                                                    const preguntaExtraida =
                                                        qMatch[1];
                                                    const posibleContexto =
                                                        preguntaTexto
                                                            .replace(
                                                                preguntaExtraida,
                                                                ""
                                                            )
                                                            .trim();

                                                    if (posibleContexto) {
                                                        contexto = contexto
                                                            ? `${contexto} ${posibleContexto}`
                                                            : posibleContexto;
                                                    }
                                                    preguntaTexto =
                                                        preguntaExtraida;
                                                }
                                                // 2. Si no hay pregunta con ??, pero hay saltos de línea, usar la última como pregunta
                                                else if (
                                                    preguntaTexto.includes("\n")
                                                ) {
                                                    const partesLineas =
                                                        preguntaTexto
                                                            .split(/\n+/)
                                                            .map((s) =>
                                                                s.trim()
                                                            )
                                                            .filter(Boolean);
                                                    if (
                                                        partesLineas.length > 1
                                                    ) {
                                                        const nuevoContexto =
                                                            partesLineas
                                                                .slice(0, -1)
                                                                .join(" ");
                                                        contexto = contexto
                                                            ? `${contexto} ${nuevoContexto}`
                                                            : nuevoContexto;
                                                        preguntaTexto =
                                                            partesLineas.slice(
                                                                -1
                                                            )[0];
                                                    }
                                                }

                                                // 3. Limpieza final de [cite]
                                                if (contexto) {
                                                    contexto =
                                                        this.limpiarTexto(
                                                            contexto
                                                        );
                                                }
                                                preguntaTexto =
                                                    this.limpiarTexto(
                                                        preguntaTexto
                                                    );

                                                return {
                                                    id: `${nombreArchivo}_${p.id}`,
                                                    contexto: contexto,
                                                    texto: preguntaTexto,
                                                    opciones: p.opciones,
                                                    respuestaCorrecta:
                                                        this.convertirLetraAIndice(
                                                            p.respuesta
                                                        ),
                                                    dificultad:
                                                        this.convertirNivelDificultad(
                                                            nivel.nivel
                                                        ),
                                                    tema: tema.tema,
                                                    origen: nombreArchivo, // Agregamos el origen de la pregunta
                                                };
                                            });
                                        preguntas.push(...preguntasProcesadas);
                                    }
                                });
                            }
                        });
                    }
                    return {
                        origen: nombreArchivo,
                        preguntas: preguntas,
                    };
                })
            );

            // Organizamos las preguntas por origen
            this.preguntasPorOrigen = {};
            resultadosPorArchivo.forEach((resultado) => {
                this.preguntasPorOrigen[resultado.origen] = resultado.preguntas;
            });

            // Aplanamos todas las preguntas para mantener compatibilidad
            this.preguntas = resultadosPorArchivo.flatMap((r) => r.preguntas);

            if (!this.preguntas || this.preguntas.length === 0) {
                throw new Error(
                    "No se encontraron preguntas en los archivos JSON"
                );
            }

            return true;
        } catch (error) {
            console.error("Error al cargar las preguntas:", error);
            return false;
        }
    }

    convertirLetraAIndice(letra) {
        // Convierte letras A, B, C, D a índices 0, 1, 2, 3
        return letra.charCodeAt(0) - "A".charCodeAt(0);
    }

    convertirNivelDificultad(nivel) {
        // Convierte el texto del nivel a los valores esperados por la aplicación
        const niveles = {
            "Dificultad Baja": "baja",
            "Dificultad Media": "media",
            "Dificultad Alta": "alta",
            "Dificultad Extrema": "extrema",
        };
        return niveles[nivel] || "baja";
    }

    filtrarPreguntasPorDificultad(dificultad) {
        const preguntasFiltradas = {};

        // Filtramos las preguntas por dificultad para cada origen
        Object.entries(this.preguntasPorOrigen).forEach(
            ([origen, preguntas]) => {
                preguntasFiltradas[origen] = preguntas.filter(
                    (pregunta) => pregunta.dificultad === dificultad
                );
            }
        );

        return preguntasFiltradas;
    }

    mezclarPreguntas(preguntas) {
        return [...preguntas].sort(() => Math.random() - 0.5);
    }

    obtenerPreguntasParaJugador(dificultad, numPreguntas, idsExcluidos = []) {
        // Selección equilibrada por origen con fallback de dificultad
        const origenes = Object.keys(this.preguntasPorOrigen || {});
        if (origenes.length === 0) return [];
        const idsExcluidosSet = new Set(idsExcluidos);

        // Prioridad de dificultades según nivel solicitado
        const prioridadDificultades = (nivel) => {
            switch (nivel) {
                case "extrema":
                    return ["extrema", "alta", "media", "baja"];
                case "alta":
                    return ["alta", "extrema", "media", "baja"];
                case "media":
                    return ["media", "alta", "baja", "extrema"];
                case "baja":
                default:
                    return ["baja", "media", "alta", "extrema"];
            }
        };

        const prioridades = prioridadDificultades(dificultad);

        // Distribuir cuota por origen (base + algunos con +1 para el resto)
        const n = origenes.length;
        const base = Math.floor(numPreguntas / n);
        let restante = numPreguntas - base * n;

        const asignaciones = {};
        origenes.forEach((origen, idx) => {
            asignaciones[origen] = base + (restante > 0 ? 1 : 0);
            if (restante > 0) restante--;
        });

        let seleccionadas = [];

        // Para cada origen, intentar llenar su cuota siguiendo la prioridad de dificultades
        origenes.forEach((origen) => {
            const disponible = this.preguntasPorOrigen[origen] || [];
            const usadas = new Set();
            let need = asignaciones[origen] || 0;

            for (const nivelPrioritario of prioridades) {
                if (need <= 0) break;
                const candidatos = disponible.filter(
                    (q) =>
                        q.dificultad === nivelPrioritario &&
                        !idsExcluidosSet.has(q.id) &&
                        !usadas.has(q)
                );
                const mezclados = this.mezclarPreguntas(candidatos);
                for (let i = 0; i < mezclados.length && need > 0; i++, need--) {
                    seleccionadas.push(mezclados[i]);
                    usadas.add(mezclados[i]);
                }
            }

            // Si aún falta cubrir la cuota, tomar de cualquier dificultad disponible en ese origen
            if (need > 0) {
                const resto = disponible.filter(
                    (q) => !idsExcluidosSet.has(q.id) && !usadas.has(q)
                );
                const mezclados = this.mezclarPreguntas(resto);
                for (let i = 0; i < mezclados.length && need > 0; i++, need--) {
                    seleccionadas.push(mezclados[i]);
                    usadas.add(mezclados[i]);
                }
            }
        });

        // Si por alguna razón no se alcanzó el número pedido (pocos datos), rellenar desde todo el pool
        if (seleccionadas.length < numPreguntas) {
            const faltan = numPreguntas - seleccionadas.length;
            const yaIds = new Set(seleccionadas.map((q) => q.id));
            const pool = this.mezclarPreguntas(this.preguntas).filter(
                (q) => !yaIds.has(q.id) && !idsExcluidosSet.has(q.id)
            );
            seleccionadas.push(...pool.slice(0, faltan));
        }

        // Finalmente mezclar y recortar al tamaño exacto
        seleccionadas = this.mezclarPreguntas(seleccionadas).slice(
            0,
            numPreguntas
        );
        this.preguntasSeleccionadas = seleccionadas;
        return seleccionadas;
    }

    verificarRespuesta(preguntaId, respuestaSeleccionada) {
        const pregunta = this.preguntasSeleccionadas.find(
            (p) => p.id === preguntaId
        );

        return pregunta && pregunta.respuestaCorrecta === respuestaSeleccionada;
    }
}

export default ManejadorPreguntas;
