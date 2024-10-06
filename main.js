// main.js

// Einstiegspunkt für die Anwendung und Koordination der Module

// Benutzername und Passwort festlegen
const userName = "User-" + Math.floor(Math.random() * 100000);
const password = "x";
document.querySelector('#user-name').innerHTML = userName;

// UI initialisieren
initializeUI();

// WebRTC-Variablen initialisieren
initializeWebRTC();

// Anwendung ist jetzt bereit
console.log('Anwendung initialisiert');
