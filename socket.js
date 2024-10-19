// socket.js

// Socket.io-Logik, einschließlich Verbindung zum Signalisierungsserver und Behandlung von Socket-Ereignissen

let socket;

async function initializeS() {
    try {
        // Socket-Verbindung herstellen
        await initializeSocket(userName, password);
        // UI aktualisieren
        hideLandingScreen();
        showWaitingScreen();
    } catch (err) {
        console.error('Fehler beim Herstellen der Socket-Verbindung:', err);
    }
}

function initializeSocket(userName, password) {
    // Verbindung zum Signalisierungsserver herstellen

    socket = io({
        auth: {
            userName, password
        },
        secure: true, // Falls HTTPS verwendet wird
        transports: ['websocket', 'polling']
    });

    // Socket-Ereignisse einrichten
    setupSocketEvents();
    console.log("socket initialized");
}

function setupSocketEvents() {
    // Bei Verbindung verfügbare Angebote abrufen
    socket.on('availableOffers', offers => {
        createOfferEls(offers);
    });

    // Neues Angebot erhalten
    socket.on('newOfferAwaiting', offers => {
        if (offers.length > 0) {
            createOfferEls(offers);
        } else {
            console.log("Keine Angebote mehr vorhanden");
            socket.disconnect();
            hideWaitingScreen();
            showLandingScreen();
        }
    });

    // Antwort auf Angebot erhalten
    socket.on('answerResponse', offerObj => {
        if (offerObj.answer) {
            addAnswer(offerObj);
        } else {
            console.log("Antwort nicht vorhanden");
        }
    });

    // ICE-Kandidat vom Server erhalten
    socket.on('receivedIceCandidateFromServer', iceCandidate => {
        addNewIceCandidate(iceCandidate);
    });

    socket.on('disconnect', (reason) => {
        console.log('socket.disconnect()');
        if (reason === 'io server disconnect') {
            // Der Server hat die Verbindung getrennt
        } else {
            // Die Verbindung wurde aus einem anderen Grund getrennt
        }
    });

    socket.on('connect', () => {
        // Verbindung zum Server hergestellt
    });
}

// Exportiere socket, falls in anderen Modulen benötigt
