"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
class Session {
    startTimeMS;
    startTimeFormated;
    endTimeMS = null;
    endTimeFormated = null;
    duration;
    constructor(startTimeMS, duration) {
        this.startTimeMS = startTimeMS;
        this.startTimeFormated = formatDate(startTimeMS);
        this.duration = duration;
    }
    setEndTime(endTimeMS) {
        this.endTimeMS = endTimeMS;
        this.endTimeFormated = formatDate(endTimeMS);
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
//# sourceMappingURL=session.js.map