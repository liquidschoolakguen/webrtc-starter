// webrtc.js

// WebRTC-bezogene Funktionen, wie das Erstellen und Verwalten der Peer-Verbindung, Handling von MediaStreams und DataChannels

let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;
let dataChannel;
let earlyHangup = false;

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

const peerConfiguration = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun.l.google.com:5349",
                "stun:stun1.l.google.com:3478",
                "stun:stun1.l.google.com:5349",
                "stun:stun2.l.google.com:19302",
                "stun:stun2.l.google.com:5349",
                "stun:stun3.l.google.com:3478",
                "stun:stun3.l.google.com:5349",
                "stun:stun4.l.google.com:19302",
                "stun:stun4.l.google.com:5349",
                "stun:stun.1und1.de:3478",
                "stun:stun.gmx.net:3478",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
                "stun:23.21.150.121:3478",
                "stun:iphone-stun.strato-iphone.de:3478",
                "stun:numb.viagenie.ca:3478",
                "stun:stun.12connect.com:3478",
                "stun:stun.12voip.com:3478",
                "stun:stun.1und1.de:3478",
                "stun:stun.2talk.co.nz:3478",
                "stun:stun.2talk.com:3478",
                "stun:stun.3clogic.com:3478",
                "stun:stun.3cx.com:3478",
                "stun:stun.a-mm.tv:3478",
                "stun:stun.aa.net.uk:3478",
                "stun:stun.acrobits.cz:3478",
                "stun:stun.actionvoip.com:3478",
                "stun:stun.advfn.com:3478",
                "stun:stun.aeta-audio.com:3478",
                "stun:stun.aeta.com:3478",
                "stun:stun.altar.com.pl:3478",
                "stun:stun.annatel.net:3478",
                "stun:stun.antisip.com:3478",
                "stun:stun.arbuz.ru:3478",
                "stun:stun.avigora.fr:3478",
                "stun:stun.awa-shima.com:3478",
                "stun:stun.b2b2c.ca:3478",
                "stun:stun.bahnhof.net:3478",
                "stun:stun.barracuda.com:3478",
                "stun:stun.bluesip.net:3478",
                "stun:stun.bmwgs.cz:3478",
                "stun:stun.botonakis.com:3478",
                "stun:stun.budgetsip.com:3478",
                "stun:stun.cablenet-as.net:3478",
                "stun:stun.callromania.ro:3478",
                "stun:stun.callwithus.com:3478",
                "stun:stun.chathelp.ru:3478",
                "stun:stun.cheapvoip.com:3478",
                "stun:stun.ciktel.com:3478",
                "stun:stun.cloopen.com:3478",
                "stun:stun.comfi.com:3478",
                "stun:stun.commpeak.com:3478",
                "stun:stun.comtube.com:3478",
                "stun:stun.comtube.ru:3478",
                "stun:stun.cope.es:3478",
                "stun:stun.counterpath.com:3478"
            ]
        },
        {
            urls: 'turn:138.68.104.196:3478', // Deine TURN-Server-Adresse
            username: 'testuser',             // Dein TURN-Server-Benutzername
            credential: 'testpass'            // Dein TURN-Server-Passwort
        }
    ]
};

function initializeWebRTC() {
    // Initialisierung, falls erforderlich
}

// Funktion zum Starten eines Anrufs
async function call() {//new offer
    await fetchUserMedia();
    didIOffer = true;
    await createPeerConnection();

    try {
        console.log("Erstelle Angebot...");
        const offer = await peerConnection.createOffer();
        //console.log(offer);
        await peerConnection.setLocalDescription(offer);
        socket.emit('newOffer', offer); // Angebot an Signalisierungsserver senden

        // UI aktualisieren

        showEarlyHangupButton();
        hideCallWithOptions();
    } catch (err) {
        console.log(err);
    }
}


async function cancelCall(){
    console.log("... Angebot zurückgezogen"+ userName);
    socket.emit('cancelOffer', userName);
    didIOffer = false;
    socket.disconnect();
    console.log('Socket-Verbindung geschlossen');
    hideWaitingScreen();
    showLandingScreen();
}

// Funktion zum Beantworten eines Angebots
async function answerOffer(offerObj) {
    await fetchUserMedia();
    didIOffer = false;
    await createPeerConnection(offerObj);
    const answer = await peerConnection.createAnswer({});
    await peerConnection.setLocalDescription(answer);
    //console.log(offerObj);
    //console.log(answer);
    offerObj.answer = answer;
    const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj);
    offerIceCandidates.forEach(c => {
        peerConnection.addIceCandidate(c);
       // console.log("====== ICE-Kandidat hinzugefügt ======");
    });
    //console.log(offerIceCandidates);

    // UI aktualisieren
    showHangupButton();
    hideCallWithOptions();
    hideAnswerButtons();
}

// Funktion zum Hinzufügen einer Antwort
async function addAnswer(offerObj) {

    await peerConnection.setRemoteDescription(offerObj.answer);
    if (earlyHangup) {
        console.log("ich will doch nicht mehr");




    } else {
        console.log("ja bereit zu tel");
        showHangupButton();
        hideCallWithOptions();
        hideAnswerButtons();
    }
    // UI aktualisieren


}

// Funktion zum Abrufen des lokalen Medienstreams
function fetchUserMedia() {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            localVideoEl.srcObject = stream;
            localStream = stream;
            resolve();
        } catch (err) {
            console.log(err);
            reject();
        }
    });
}

// Funktion zum Erstellen der Peer-Verbindung
function createPeerConnection(offerObj) {
    return new Promise(async (resolve, reject) => {
        peerConnection = new RTCPeerConnection(peerConfiguration);
        remoteStream = new MediaStream();
        remoteVideoEl.srcObject = remoteStream;

        if (didIOffer) {
            // Wir sind der Anrufer und erstellen den DataChannel
            dataChannel = peerConnection.createDataChannel('chat');
            setupDataChannel();
        } else {
            // Wir sind der Angenommene und warten auf den DataChannel
            peerConnection.ondatachannel = event => {
                dataChannel = event.channel;
                setupDataChannel();
            };
        }

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.addEventListener("signalingstatechange", (event) => {
            //console.log(event);
            //console.log(peerConnection.signalingState);
        });

        peerConnection.addEventListener('icecandidate', e => {
            //console.log('........ ICE-Kandidat gefunden! ......');
            //console.log(e);
            if (e.candidate) {
                socket.emit('sendIceCandidateToSignalingServer', {
                    iceCandidate: e.candidate,
                    iceUserName: userName,
                    didIOffer,
                });
            }
        });

        peerConnection.addEventListener('track', e => {
           // console.log("Empfange Track vom anderen Peer!");
           // console.log(e);
            e.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track, remoteStream);
               // console.log("Track erfolgreich hinzugefügt");
            });
        });

        peerConnection.addEventListener('connectionstatechange', () => {
            if (peerConnection.connectionState === 'connected') {
                console.log('Peers connected!');
                // Socket-Verbindung schließen
                socket.disconnect();
                console.log('Socket-Verbindung geschlossen');

                // UI aktualisieren

                hideWaitingScreen();
                showWebRTCScreen();
            }
        });

        if (offerObj) {
            await peerConnection.setRemoteDescription(offerObj.offer);
        }
        resolve();
    });
}

// Funktion zum Einrichten des DataChannels
function setupDataChannel() {
    dataChannel.onopen = () => {
       // console.log('DataChannel ist offen');
        if(earlyHangup){
            hangup(true);
            earlyHangup = false;
        }
        else{

            document.querySelector('#chat-input').disabled = false;
            document.querySelector('#send-button').disabled = false;
        }
    };

    dataChannel.onmessage = (event) => {
        console.log('Nachricht empfangen:', event.data);

        // Prüfen, ob es sich um ein Hangup-Ereignis handelt
        if (event.data === '__hangup__') {
            console.log('Remote Peer hat aufgelegt');
            hangup(false); // Lokale Bereinigung durchführen, ohne erneut Hangup-Nachricht zu senden
            return;
        }

        const chatMessages = document.querySelector('#chat-messages');
        const messageEl = document.createElement('div');
        messageEl.textContent = 'Remote: ' + event.data;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    dataChannel.onclose = () => {
        console.log('DataChannel ist geschlossen');
        document.querySelector('#chat-input').disabled = true;
        document.querySelector('#send-button').disabled = true;
    };

    dataChannel.onerror = (error) => {
        console.error('DataChannel Fehler:', error);
    };
}

// Funktion zum Hinzufügen eines neuen ICE-Kandidaten
function addNewIceCandidate(iceCandidate) {
    peerConnection.addIceCandidate(iceCandidate);
   // console.log("====== ICE-Kandidat hinzugefügt ======");
}

// Funktion zum Beenden des Anrufs
function hangup(sendSignal = true) {
    console.log('Beende Anruf');

    // Hangup-Nachricht über DataChannel senden, bevor er geschlossen wird
    if (sendSignal && dataChannel && dataChannel.readyState === 'open') {
        console.log('Beende Anruf__HANGUP');
        dataChannel.send('__hangup__');
    }

    if (dataChannel) {
        dataChannel.close();
        dataChannel = null;
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        remoteStream = null;
    }
    // Deaktiviere Chat-UI-Elemente
    document.querySelector('#chat-input').disabled = true;
    document.querySelector('#send-button').disabled = true;
    // Leere Video-Elemente
    localVideoEl.srcObject = null;
    remoteVideoEl.srcObject = null;
    // Entferne alle Chat-Nachrichten
    document.querySelector('#chat-messages').innerHTML = '';
    // Setze Zustand zurück
    didIOffer = false;
    console.log('Anruf beendet');

    // UI aktualisieren
    //hideHangupButton();
    //hideVideoAndChat();
    hideWebRTCScreen();
    showLandingScreen();
    //showConnectButton();
}
