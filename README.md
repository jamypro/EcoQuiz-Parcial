# EcoQuiz 🌍

pagina web: https://jamypro.github.io/proyectoEcoQuiz/

EcoQuiz es una aplicación web interactiva de preguntas y respuestas diseñada para educar y sensibilizar sobre temas medioambientales como el reciclaje, el cambio climático, las energías renovables y la sostenibilidad. Permite partidas de uno o varios jugadores con diferentes modos y niveles de dificultad.

## 🚀 Flujo de la Aplicación

El flujo de la aplicación se divide en tres pantallas principales: Inicio, Juego y Resultados.

### 1. Pantalla de Inicio (Configuración)

Es la primera pantalla que ve el usuario. Aquí se configura la partida.

-   **Formulario de Configuración**: El usuario debe seleccionar:
    -   **Número de Jugadores**: De 1 a 5. Al cambiar esta opción, se generan dinámicamente los campos para introducir los nombres.
    -   **Nombres de los Jugadores**: Campos de texto para cada participante.
    -   **Número de Preguntas**: Cantidad de preguntas que responderá cada jugador.
    -   **Dificultad**: Baja, Media, Alta o Extrema.
    -   **Modo de Juego**:
        -   `Turneado`: Cada jugador responde todas sus preguntas de forma consecutiva.
        -   `Intercalado`: Los jugadores se turnan para responder una pregunta a la vez.
-   **Iniciar Juego**: Al enviar el formulario, la interfaz (`interfaz.js`) captura los datos y dispara un evento global `iniciarJuego`.

### 2. Pantalla de Juego

Una vez iniciada la partida, la aplicación entra en la fase de juego.

-   **Carga de Preguntas**: El gestor de preguntas (`preguntas.js`) carga de forma asíncrona los archivos `.json` de la carpeta `data/`. Estos archivos contienen las preguntas, que son procesadas y estructuradas para su uso en el juego.
-   **Asignación de Preguntas**: A cada jugador se le asigna un conjunto único de preguntas, filtradas por la dificultad seleccionada y balanceadas para que provengan de diferentes temas (archivos JSON).
-   **Temporizador**: Se inicia un temporizador global para toda la partida. El tiempo total se calcula multiplicando el número total de preguntas por el tiempo asignado a cada una en `config.js`.
-   **Ciclo de Juego**:
    1.  Se muestra el nombre del jugador en turno.
    2.  Se presenta una pregunta con su contexto (si lo tiene) y las opciones de respuesta.
    3.  El jugador selecciona una opción.
    4.  El sistema verifica si la respuesta es correcta y actualiza el puntaje del jugador (aciertos y fallos).
    5.  Se reproduce un sonido de acierto o error.
    6.  Se pasa al siguiente turno. Dependiendo del modo de juego, el siguiente jugador puede ser el mismo u otro.
    7.  Este ciclo se repite hasta que se responden todas las preguntas o se agota el tiempo.

### 3. Pantalla de Resultados

Al finalizar el juego, se muestra un resumen completo de la partida.

-   **Podio**: Muestra a los tres mejores jugadores con medallas (🥇, 🥈, 🥉), sus nombres y puntajes.
-   **Tabla de Posiciones**: Una tabla detallada con todos los jugadores, ordenados por puntaje, mostrando aciertos, fallos y puntuación total.
-   **Recomendaciones**: Mensajes para fomentar la conciencia ambiental.
-   **Animación**: Se dispara una animación de confeti para celebrar el final del juego.
-   **Opciones Finales**:
    -   **Jugar de Nuevo**: Reinicia el juego y lleva al usuario a la pantalla de inicio, manteniendo la configuración anterior.
    -   **Volver al Inicio**: Reinicia completamente el estado del juego y vuelve a la pantalla de inicio.

## 🏗️ Estructura del Código (JavaScript)

El código está modularizado en clases, cada una con una responsabilidad específica.

-   `app.js`: Punto de entrada de la aplicación. Crea la instancia principal de `Juego`.

-   `juego.js` (Clase `Juego`): Es el orquestador principal.

    -   Inicializa todos los módulos.
    -   Controla el flujo general del juego (iniciar, manejar respuestas, finalizar).
    -   Gestiona el estado de la partida.

-   `interfaz.js` (Clase `InterfazUI`): Responsable de toda la manipulación del DOM.

    -   Gestiona las tres pantallas principales.
    -   Renderiza las preguntas, opciones y resultados.
    -   Actualiza elementos dinámicos como el temporizador y la barra de progreso.
    -   Captura las interacciones del usuario (clics, envíos de formulario) y las comunica al `juego.js` a través de eventos.

-   `preguntas.js` (Clase `ManejadorPreguntas`): Gestiona todo lo relacionado con las preguntas.

    -   Carga y parsea los archivos JSON de preguntas.
    -   Procesa el texto de las preguntas para separar el contexto de la pregunta en sí.
    -   Filtra y selecciona preguntas según la dificultad y el número solicitado, intentando balancear los temas.

-   `jugadores.js` (Clase `ManejadorJugadores`): Administra los datos de los jugadores.

    -   Crea y almacena los perfiles de los jugadores.
    -   Lleva el registro de aciertos, fallos y puntaje.
    -   Gestiona el sistema de turnos.

-   `temporizador.js` (Clase `Temporizador`): Controla el tiempo de la partida.

    -   Maneja un intervalo que descuenta el tiempo restante.
    -   Ejecuta callbacks para actualizar la UI (`onTick`) o para finalizar el juego cuando el tiempo se agota (`onTimeout`).

-   `config.js`: Archivo de configuración central.

    -   Contiene constantes como el tiempo por pregunta, número de jugadores, rutas a los archivos de preguntas y sonidos.

-   `resultados.js` (Clase `ManejadorResultados`): Aunque presente, este módulo no se utiliza activamente en el flujo principal. La lógica de cálculo y ordenamiento de resultados se maneja directamente en `jugadores.js`.

## 🎨 Estilos y Recursos

-   `style.css`: Contiene todos los estilos de la aplicación, incluyendo animaciones, diseño responsivo y personalizaciones de Bootstrap.
-   `data/`: Carpeta con los archivos `.json` que actúan como base de datos de preguntas.
-   `assets/`: Carpeta para recursos como sonidos e imágenes.
