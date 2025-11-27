// temporizador.js
class Temporizador {
    constructor(tiempoTotal, onTick, onTimeout) {
        this.tiempoTotal = tiempoTotal;
        this.tiempoRestante = tiempoTotal;
        this.onTick = onTick;
        this.onTimeout = onTimeout;
        this.intervalId = null;
    }

    iniciar() {
        this.intervalId = setInterval(() => {
            this.tiempoRestante--;

            if (this.tiempoRestante <= 0) {
                this.detener();
                this.onTimeout();
            } else {
                this.onTick(this.tiempoRestante);
            }
        }, 1000);
    }

    detener() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reiniciar() {
        this.detener();
        this.tiempoRestante = this.tiempoTotal;
        this.iniciar();
    }

    obtenerTiempoFormateado() {
        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundos = this.tiempoRestante % 60;
        return `${minutos.toString().padStart(2, "0")}:${segundos
            .toString()
            .padStart(2, "0")}`;
    }

    obtenerPorcentajeRestante() {
        return (this.tiempoRestante / this.tiempoTotal) * 100;
    }
}

export default Temporizador;
