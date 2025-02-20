import * as vscode from 'vscode';
import * as path from 'path'; 
import { Session } from './session';



let storage: vscode.Memento;

let sessions: Session[] = [];

let panel: vscode.WebviewPanel | undefined = undefined;




let startTime = Date.now();
let paused = false;
let totalPausedTime = 0;
let pauseStartTime = Date.now();
let recoveredSession = false;


function startTimer() {
	//panel!.webview.postMessage({ command: 'startTimerResponse', paused: paused });
	if (paused) {
		paused = false;
		totalPausedTime += Date.now() - pauseStartTime;
		
	}
	else {
		paused = true;
		pauseStartTime = Date.now();
	}
	}

function getTime() {
	let elapsedMilliseconds = Date.now() - startTime - totalPausedTime; // Obtener el tiempo transcurrido en milisegundos
	let elapsedSeconds = Math.floor(elapsedMilliseconds / 1000); // Convertimos a segundos
	let hours = Math.floor(elapsedSeconds / 3600); // Calculamos las horas
	let minutes = Math.floor((elapsedSeconds % 3600) / 60); // Calculamos los minutos
	let seconds = elapsedSeconds % 60; // Calculamos los segundos restantes
	let duration =  hours + 'h '+  minutes + 'm ' + seconds + 's'; // Formateamos la duración
	return duration;
}


function sayHello(){
	if (recoveredSession){
		vscode.window.showInformationMessage("Welcome back! We've picked up your last session. Let's go! 🚀");
	}
	else{
		vscode.window.showInformationMessage("New coding session started! Happy coding! 🚀");
	}
}

function saveSession() {
    // Obtener la duración y crear la nueva sesión
    let duration = getTime();
	const now = Date.now();
	let durationMS = Date.now() - startTime - totalPausedTime;
    let newSession = new Session(startTime, durationMS);
    console.log("Nueva sesión:", newSession);
    

    // Buscar si ya existe una sesión para hoy dentro de un rango de 2 horas
    let existingIndex = sessions.findIndex((session) => {        
        // Verificar si la diferencia es menor o igual a 2 horas (120 * 60 * 1000 ms)
		let timeSession = session.startTimeMS + session.durationMS;
        return Math.abs(now - timeSession) <= 120 * 60 * 1000;
        
    });

    if (existingIndex !== -1) {
        // Si existe, se sobrescribe esa sesión
        console.log("Se encontró una sesión reciente para hoy. Sobrescribiendo...");
        sessions[existingIndex] = newSession;
    } else {
        // Si no existe, se agrega una nueva sesión
        console.log("No se encontró sesión reciente para hoy. Creando una nueva sesión...");
        sessions.push(newSession);
    }

    // Convertir el array de sesiones a JSON
    let sessionsJson = JSON.stringify(sessions);
    
    // Guardar en el storage (por ejemplo, context.globalState o storage que estés usando)
    if (storage) {
        storage.update('sessions', sessionsJson);
        console.log("Sesiones guardadas en storage.");
    }
}

function loadSession() {
    console.log("Cargando sesiones...");
    
    if (storage) {
        // Recuperar el JSON del storage
        let sessionsJson = storage.get('sessions');

        if (sessionsJson) {
            try {
                // Convertir el JSON de nuevo en un array de objetos
                let sessionsArray = JSON.parse(sessionsJson as string);
                
                // Reconstituir los objetos Session con los datos recuperados
                sessions = sessionsArray.map((sessionData: { startTimeMS: number, durationMS: number }) => {
                    return new Session(sessionData.startTimeMS,sessionData.durationMS);
                });

				console.log("Sesiones recuperadas:", sessions);

				// Verificar si hay una sesión reciente (menos de 2 horas)
				const now = Date.now();
				let recentSession = sessions.find(session => Math.abs(now - (session.startTimeMS + session.durationMS)) <= 120 * 60 * 1000);
	
				if (recentSession) {
					// Si hay una sesión reciente, restablecer el startTime con el de la sesión y recoveredSession a true
					recoveredSession = true;
					console.log("Hay una sesión reciente. Restableciendo el startTime...");
					startTime = recentSession.startTimeMS;  // Restablecer el startTime con la sesión encontrada
					totalPausedTime += now -  (recentSession.startTimeMS + recentSession.durationMS); // Calcular el tiempo pausado
				} else {
					console.log("No hay sesiones recientes.");
				}

                console.log("Sesiones recuperadas:", sessions);
            } catch (error) {
                console.error("Error al parsear las sesiones:", error);
                sessions = []; // Si hay un error en el JSON, inicializamos con un arreglo vacío
            }
        } else {
            console.log("No se encontraron sesiones guardadas.");
            sessions = []; // Si no hay sesiones guardadas, inicializamos con un arreglo vacío
        }
    }
}


function clearSessions() {
	sessions = [];
    if (storage) {
        storage.update('sessions', ''); // O puedes usar null en lugar de ''
        console.log("Sesiones borradas del storage.");
    }
}



export function activate(context: vscode.ExtensionContext) {

	storage = context.workspaceState;


	// Comando para abrir el panel lateral
	const showPanelDisposable = vscode.commands.registerCommand('extension.showPanel', () => {
		if (!panel) {
			console.log("Iniciando el registro del Webview...");
			// Crear el panel
			panel = vscode.window.createWebviewPanel(
				'codingSessionPanel',
				'Coding Session Timer',
				vscode.ViewColumn.One, // Esto lo pone en la columna 1 (la principal)
				{
					enableScripts: true // Habilita la ejecución de scripts dentro del Webview
				}
			);
			console.log("Webview registrado correctamente.");
			panel.webview.html = getWebviewContent(context); // Define el contenido HTML del panel
            // Escuchar los mensajes enviados desde el webview
            panel.webview.onDidReceiveMessage(
                message => {
                    switch (message.command) {

						case 'getTime':
							let time = getTime();
							panel!.webview.postMessage({ command: 'getTimeResponse', data: time });
							return;

						case 'startTimer':
							startTimer();
							return;

                        case 'saveSession':
                            saveSession();
                            return;

                        case 'loadSession':
                            loadSession();
                            return;

						case 'clearSessions':
							clearSessions();
							return
                    }
                },
                undefined,
                context.subscriptions
            );
			
		}
	});
	startTimer();
	loadSession();
	sayHello();

	const saveListener = vscode.workspace.onDidSaveTextDocument((document) => { // cuando se guarda un archivo, guardamos la sesión
		saveSession();
		console.log("Guardando sesion al guardar archivo...");
	});
	context.subscriptions.push(saveListener);

	context.subscriptions.push(showPanelDisposable);
}

export function deactivate(){
	if (panel) {
		panel.dispose();
	}
}
	
function getWebviewContent(context: vscode.ExtensionContext) {
	const gifUri = panel!.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'images', 'Chilling_guy_coding.gif')));
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
                    h1,h2 { color: #2685a5; }
                    button { padding: 10px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <h1>Coding Timer</h1>
				<img src="${gifUri}" alt="Chilling guy coding" style="width:25%";>
				<h2>💻 Enjoy coding! ☕</h2>
                <p>Tiempo en esta sesión: <span id="time">0m</span></p>
                <button id="startBtn" onclick="startTimer()">Pausar</button>
				
				<button onclick="testSave()">Guardar</button>
                <button onclick="testLoad()">Cargar</button>
				<button onclick="testClear()">Limpiar</button>




                <script>
					const vscode = acquireVsCodeApi();

                    let startTime = Date.now();
					let durationTxt = "";
					let paused = false;
					let timerInterval;
					let totalPausedTime = 0;
					let pauseStartTime = Date.now();
					

					function updateTimer() {
						vscode.postMessage({ command: 'getTime' });
						window.addEventListener('message', event => {
							const message = event.data; // El mensaje enviado desde el webview
							if (message.command === 'getTimeResponse') {
							document.getElementById("time").innerText = message.data;
							}
							});
						
					}

                    function startTimer() {
					vscode.postMessage({ command: 'startTimer' });
						if (paused) {
							paused = false;
							document.getElementById("startBtn").innerText = "Pausar";
							timerInterval = setInterval(updateTimer, 1000);
							
						}
						else {
							paused = true;
							clearInterval(timerInterval);
							document.getElementById("startBtn").innerText = "Reanudar";
						}
                    }

				function testSave() {
					vscode.postMessage({ command: 'saveSession'});
				}
				function testLoad() {
					vscode.postMessage({ command: 'loadSession' });
				}

				function testClear() {
					vscode.postMessage({ command: 'clearSessions' });
				}
				window.onload = function() {
					updateTimer();
					timerInterval = setInterval(updateTimer, 1000);
				}			
                </script>
            </body>
            </html>
        `;
}
