// socket.js

// Socket.io-Logik, einschließlich Verbindung zum Signalisierungsserver und Behandlung von Socket-Ereignissen

let socket;


async function initializeS() {
    try {
      // Socket-Verbindung herstellen
      await initializeSocket(userName, password);
      // UI aktualisieren
      //hideConnectButton();
      //showCallWithOptions();
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
       // console.log(offers);
        createOfferEls(offers);
    });

    // Neues Angebot erhalten
    socket.on('newOfferAwaiting', offers => {
        if(offers.length > 0){
            createOfferEls(offers);
        }else{
            console.log("Keine Angebote vorhanden");
            socket.disconnect();
            hideWaitingScreen();
            showLandingScreen();
        }
    });

    // Antwort auf Angebot erhalten
    socket.on('answerResponse', offerObj => {
        //console.log("-----------------------" +offerObj.answer);
        if(offerObj.answer){
            addAnswer(offerObj);
        }else{
            console.log("Antwort nicht vorhanden");
        }
    });

    // ICE-Kandidat vom Server erhalten
    socket.on('receivedIceCandidateFromServer', iceCandidate => {
       // console.log("---------------------------ICE");
        addNewIceCandidate(iceCandidate);
        //console.log(iceCandidate);
    });

    socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
            // Der Server hat die Verbindung absichtlich getrennt
           // console.log('Der Server hat die Verbindung getrennt');
           // socket.connect(); // Optional: Versuchen Sie, die Verbindung wiederherzustellen
        } else {
            // Die Verbindung wurde aus einem anderen Grund getrennt
          //  console.log('Die Verbindung wurde getrennt:', reason);
        }
    });



    socket.on('connect', () => {
       // console.log('Verbindung zum Server hergestellt');

    });





}

// Exportiere socket, falls in anderen Modulen benötigt
