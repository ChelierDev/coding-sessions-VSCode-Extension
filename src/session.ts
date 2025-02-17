export class Session {
    startTimeMS: number;
    startTimeFormated: string;
    duration: string;

    constructor(startTimeMS: number,duration: string) {
        this.startTimeMS = startTimeMS;
        this.startTimeFormated = formatDate(startTimeMS);
        this.duration = duration;

    }

    
}

function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0'); // Añade un 0 al día si es necesario
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados, así que sumamos 1
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0'); // Obtiene la hora, asegurando que tenga 2 dígitos
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Obtiene los minutos, asegurando que tenga 2 dígitos

    return `${day}-${month}-${year} ${hours}:${minutes}`;
}
