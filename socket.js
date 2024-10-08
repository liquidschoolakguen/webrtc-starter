// socket.js

// Socket.io-Logik, einschließlich Verbindung zum Signalisierungsserver und Behandlung von Socket-Ereignissen

let socket;

function initializeSocket(userName, password) {
    // Verbindung zum Signalisierungsserver herstellen
   // socket = io.connect('https://127.0.0.1:8181/', {
    socket = io.connect('https://192.168.146.225:8181/', {
        auth: {
            userName, password
        }
    });

    // Socket-Ereignisse einrichten
    setupSocketEvents();
}

function setupSocketEvents() {
    // Bei Verbindung verfügbare Angebote abrufen
    socket.on('availableOffers', offers => {
        console.log(offers);
        createOfferEls(offers);
    });

    // Neues Angebot erhalten
    socket.on('newOfferAwaiting', offers => {
        createOfferEls(offers);
    });

    // Antwort auf Angebot erhalten
    socket.on('answerResponse', offerObj => {
        console.log(offerObj);
        addAnswer(offerObj);
    });

    // ICE-Kandidat vom Server erhalten
    socket.on('receivedIceCandidateFromServer', iceCandidate => {
        addNewIceCandidate(iceCandidate);
        console.log(iceCandidate);
    });

    // Keine Hangup-Ereignisse über Socket mehr erforderlich
}

// Exportiere socket, falls in anderen Modulen benötigt
