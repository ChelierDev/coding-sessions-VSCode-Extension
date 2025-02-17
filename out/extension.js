"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const session_1 = require("./session");
let storage;
let startTime = Date.now();
let paused = true;
let timerInterval;
let totalPausedTime = 0;
let pauseStartTime = Date.now();
let sessions = [
    new session_1.Session(Date.now(), "poca"),
    new session_1.Session(Date.now(), "mucha"),
];
let panel = undefined;
function testSave() {
    // Convertir el array de objetos Session a una cadena JSON
    let sessionsJson = JSON.stringify(sessions);
    // Guardar en el storage
    if (storage) {
        storage.update('sessions', sessionsJson);
        console.log("Array de sesiones guardado en storage.");
    }
}
function testLoad() {
    if (storage) {
        // Recuperar el JSON del storage
        let sessionsJson = storage.get('sessions');
        // Convertir el JSON de nuevo en un array de objetos
        let sessionsArray = JSON.parse(sessionsJson);
        // Reconstituir los objetos Session con los datos recuperados
        let recoveredSessions = sessionsArray.map((sessionData) => {
            return new session_1.Session(sessionData.startTime, sessionData.duration);
        });
        console.log("Sesiones recuperadas:", recoveredSessions);
    }
}
function activate(context) {
    storage = context.workspaceState;
    // Comando para abrir el panel lateral
    const showPanelDisposable = vscode.commands.registerCommand('extension.showPanel', () => {
        if (!panel) {
            // Crear el panel
            panel = vscode.window.createWebviewPanel('codingSessionPanel', 'Coding Session Timer', vscode.ViewColumn.One, // Esto lo pone en la columna 1 (la principal)
            {
                enableScripts: true // Habilita la ejecución de scripts dentro del Webview
            });
            panel.webview.html = getWebviewContent(context); // Define el contenido HTML del panel
        }
    });
    context.subscriptions.push(showPanelDisposable);
}
function deactivate() {
    if (panel) {
        panel.dispose();
    }
}
function getWebviewContent(context) {
    const gifUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'images', 'Chilling_guy_coding.gif')));
    // HTML para el Webview
    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Session Timer</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 10px; }
                    h1 { color: #2685a5; }
                    button { padding: 10px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <h1>Coding Timer ☕💻</h1>
				<img src="${gifUri}" alt="Mario Chilling Programming" style="width:25%";>
                <p>Tiempo en esta sesión: <span id="time">0m</span></p>
                <button id="startBtn" onclick="startTimer()">Iniciar</button>
                <button onclick="resetTimer().gif">Reset</button>

                <button onclick="testLoad()">Test</button>
				
                <script>
                    let startTime = Date.now();
					let paused = true;
					let timerInterval;
					let totalPausedTime = 0;
					let pauseStartTime = Date.now();

					function updateTimer() {
						let elapsedMilliseconds = Date.now() - startTime - totalPausedTime; // Obtener el tiempo transcurrido en milisegundos
						let elapsedSeconds = Math.floor(elapsedMilliseconds / 1000); // Convertimos a segundos
						let hours = Math.floor(elapsedSeconds / 3600); // Calculamos las horas
						let minutes = Math.floor((elapsedSeconds % 3600) / 60); // Calculamos los minutos
						let seconds = elapsedSeconds % 60; // Calculamos los segundos restantes

						document.getElementById("time").innerText =hours + 'h '+  minutes + 'm ' + seconds + 's';
					}

                    function startTimer() {
						if (paused) {
							paused = false;
							totalPausedTime += Date.now() - pauseStartTime;
							document.getElementById("startBtn").innerText = "Pausar";
							timerInterval = setInterval(updateTimer, 1000);
							
						}
						else {
							paused = true;
							clearInterval(timerInterval);
							pauseStartTime = Date.now();
							document.getElementById("startBtn").innerText = "Reanudar";
						}
                    }
                    function resetTimer() {
                        startTime = Date.now();
						totalPausedTime = 0;
						pauseStartTime = Date.now();
                        updateTimer();
                    }

					function testLoad() {
						${testLoad()};
					}
                </script>
            </body>
            </html>
        `;
}
//# sourceMappingURL=extension.js.map