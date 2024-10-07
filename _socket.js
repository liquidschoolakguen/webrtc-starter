// socket.js

// Socket.io-Logik, einschließlich Verbindung zum Signalisierungsserver und Behandlung von Socket-Ereignissen

let socket;

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
