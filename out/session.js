"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
class Session {
    startTimeMS;
    startTimeFormated;
    durationMS;
    durationFormated;
    proyectName;
    constructor(startTimeMS, durationMS, proyectName) {
        this.startTimeMS = startTimeMS;
        this.startTimeFormated = formatDate(startTimeMS);
        this.durationMS = durationMS;
        this.durationFormated = formatTime(durationMS);
        this.proyectName = proyectName;
    }
}
exports.Session = Session;
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0'); // Añade un 0 al día si es necesario
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados, así que sumamos 1
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0'); // Obtiene la hora, asegurando que tenga 2 dígitos
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Obtiene los minutos, asegurando que tenga 2 dígitos
    return `${day}-${month}-${year} ${hours}:${minutes}`;
}
function formatTime(duration) {
    let elapsedSeconds = Math.floor(duration / 1000); // Convertimos a segundos
    let hours = Math.floor(elapsedSeconds / 3600); // Calculamos las horas
    let minutes = Math.floor((elapsedSeconds % 3600) / 60); // Calculamos los minutos
    let seconds = elapsedSeconds % 60; // Calculamos los segundos restantes
    return (hours + 'h ' + minutes + 'm ' + seconds + 's'); // Formateamos la duración
}
//# sourceMappingURL=session.js.map