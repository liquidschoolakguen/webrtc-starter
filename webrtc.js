// webrtc.js

// WebRTC-bezogene Funktionen, wie das Erstellen und Verwalten der Peer-Verbindung, Handling von MediaStreams und DataChannels

let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;
let dataChannelChat;
let dataChannelSystem;
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
async function call(videoEnabled, audioEnabled, chatEnabled) {
    await fetchUserMedia(videoEnabled, audioEnabled);
    didIOffer = true;

    // Speichern Sie die ausgewählten Optionen
    const offerOptions = {
        videoEnabled,
        audioEnabled,
        chatEnabled
    };

    await createPeerConnection(null, offerOptions);

    try {
        console.log("Erstelle Angebot...");
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Senden Sie das Angebot zusammen mit den Optionen
        socket.emit('newOffer', { offer, offerOptions });

        // UI aktualisieren
        showEarlyHangupButton();
        hideCallWithOptions();

        // UI basierend auf den Optionen aktualisieren
        // updateUIForOptions(offerOptions);
    } catch (err) {
        console.log(err);
    }
}


async function cancelCall() {
    console.log("... Angebot zurückgezogen");
    socket.emit('cancelOffer', userName);
    didIOffer = false;
    closeWebRTC();
    socket.disconnect();
    hideWaitingScreen();
    showLandingScreen();
}

// Funktion zum Beantworten eines Angebots
// Funktion zum Beantworten eines Angebots
async function answerOffer(offerObj) {
    const { offer, offerOptions } = offerObj;

    await fetchUserMedia(offerOptions.videoEnabled, offerOptions.audioEnabled);
    didIOffer = false;
    await createPeerConnection(offerObj, offerOptions);

    const answer = await peerConnection.createAnswer({});
    await peerConnection.setLocalDescription(answer);
    offerObj.answer = answer;

    const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj);
    offerIceCandidates.forEach(c => {
        peerConnection.addIceCandidate(c);
    });

    // UI aktualisieren
    showHangupButton();
    hideCallWithOptions();
    hideAnswerButtons();

    // UI basierend auf den Optionen aktualisieren
    updateUIForOptions(offerOptions);
}

// Funktion zum Hinzufügen einer Antwort
async function addAnswer(offerObj) {
    await peerConnection.setRemoteDescription(offerObj.answer);
    if (earlyHangup) {
        console.log("...Angebot zurückgezogen");
    } else {
        //console.log("ja bereit zu tel");
        showHangupButton();
        hideCallWithOptions();
        hideAnswerButtons();

        // UI basierend auf den Optionen aktualisieren
        updateUIForOptions(offerObj.offerOptions);
    }
}

// Funktion zum Abrufen des lokalen Medienstreams
function fetchUserMedia(videoEnabled, audioEnabled) {
    return new Promise(async (resolve, reject) => {
        try {
            if (videoEnabled || audioEnabled) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: videoEnabled,
                    audio: audioEnabled,
                });
                localVideoEl.srcObject = stream;
                localStream = stream;
            }
            resolve();
        } catch (err) {
            console.log(err);
            reject();
        }
    });
}

// Funktion zum Erstellen der Peer-Verbindung
function createPeerConnection(offerObj = null, options = {}) {
    return new Promise(async (resolve, reject) => {

        const { chatEnabled } = options;


        peerConnection = new RTCPeerConnection(peerConfiguration);
        remoteStream = new MediaStream();
        remoteVideoEl.srcObject = remoteStream;

        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
        }

                // DataChannel-Optionen für zuverlässige und geordnete Übertragung
                const dataChannelOptions = {
                    ordered: true,       // Daten werden in der Reihenfolge empfangen
                    maxRetransmits: 10 // Unbegrenzte Wiederholungsversuche für zuverlässige Übertragung
                };


        // Immer den dataChannelSystem erstellen
        if (didIOffer) {
            // Wir sind der Anrufer
            dataChannelSystem = peerConnection.createDataChannel('system', dataChannelOptions);
            setupDataChannelSystem(dataChannelSystem);

            if (chatEnabled) {
                // Nur erstellen, wenn Chat aktiviert ist
                dataChannelChat = peerConnection.createDataChannel('chat', dataChannelOptions);
                setupDataChannelChat(dataChannelChat);
            }
        } else {
            // Wir sind der Angenommene
            peerConnection.ondatachannel = event => {
                if (event.channel.label === 'system') {
                    dataChannelSystem = event.channel;
                    setupDataChannelSystem(dataChannelSystem);
                } else if (event.channel.label === 'chat') {
                    dataChannelChat = event.channel;
                    setupDataChannelChat(dataChannelChat);
                }
            };
        }



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
            console.log("........ "+peerConnection.connectionState);
            if (peerConnection.connectionState === 'connected') {
                console.log('Peers connected!');
                // Socket-Verbindung schließen
                socket.disconnect();


                // UI aktualisieren

                hideWaitingScreen();
                showWebRTCScreen();
            }


            if (peerConnection.connectionState === 'disconnected') {
                console.log('Peers disconnected!');

            }




        });

        if (offerObj) {
            await peerConnection.setRemoteDescription(offerObj.offer);
        }
        resolve();
    });
}

function setupDataChannelSystem(channel) {
    channel.onopen = () => {
        console.log('dataChannelSystem ist offen');
    };

    channel.onmessage = (event) => {
       // console.log('Systemnachricht empfangen:', event.data);

        // Behandlung von Hangup-Nachrichten
        if (event.data === '__hangup__') {
           // console.log('Remote Peer hat aufgelegt');

           closeWebRTC();

        }
    };

    channel.onclose = () => {
       // console.log('dataChannelSystem ist geschlossen');
        //hangup(false);

    };

    channel.onerror = (error) => {
        //console.error('dataChannelSystem Fehler:', error);
    };
}

// webrtc.js

function setupDataChannelChat(channel) {
    channel.onopen = () => {
        console.log('dataChannelChat ist offen');
        document.querySelector('#chat-input').disabled = false;
        document.querySelector('#send-button').disabled = false;
    };

    channel.onmessage = (event) => {
        console.log('Chatnachricht empfangen:', event.data);

        try {
            const messageObj = JSON.parse(event.data);
            if (messageObj.type === 'message') {
                // Verarbeite die empfangene Nachricht
                const chatMessages = document.querySelector('#chat-messages');
                const messageEl = document.createElement('div');
                messageEl.textContent = 'Remote: ' + messageObj.data;
                chatMessages.appendChild(messageEl);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // Sende eine ACK-Nachricht zurück
                const ackObj = {
                    type: 'ack',
                    id: messageObj.id
                };
                channel.send(JSON.stringify(ackObj));
            } else if (messageObj.type === 'ack') {
                // Verarbeite die ACK-Nachricht
                const ackedMessageId = messageObj.id;
                // Rufe die UI-Funktion auf, um die Nachricht zu markieren

                    markMessageAsAcked(ackedMessageId);

            }
        } catch (error) {
            console.error('Fehler beim Verarbeiten der Chatnachricht:', error);
        }
    };

    channel.onclose = () => {
        //console.log('dataChannelChat ist geschlossen');
        document.querySelector('#chat-input').disabled = true;
        document.querySelector('#send-button').disabled = true;
    };

    channel.onerror = (error) => {
        // console.error('dataChannelChat Fehler:', error);
    };
}



// Funktion zum Hinzufügen eines neuen ICE-Kandidaten
function addNewIceCandidate(iceCandidate) {
    peerConnection.addIceCandidate(iceCandidate);
    // console.log("====== ICE-Kandidat hinzugefügt ======");
}

// Funktion zum Beenden des Anrufs
function hangup() {
   console.log('Beende Anruf');

    // Hangup-Nachricht über dataChannelSystem senden
    if (dataChannelSystem && dataChannelSystem.readyState === 'open') {
        console.log('Sende Hangup-Nachricht');
        dataChannelSystem.send('__hangup__');




    }
    closeWebRTC();

    // UI aktualisieren

}

function closeWebRTC(){

    // DataChannels schließen
    if (dataChannelChat) {
        dataChannelChat.close();
        dataChannelChat = null;
    }
    if (dataChannelSystem) {
        dataChannelSystem.close();
        dataChannelSystem = null;
    }

    // Peer-Verbindung schließen
    //console.log("........ "+peerConnection.connectionState);
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    // Streams stoppen
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        remoteStream = null;
    }

    // UI-Elemente deaktivieren
    document.querySelector('#chat-input').disabled = true;
    document.querySelector('#send-button').disabled = true;

    // Video-Elemente leeren
    localVideoEl.srcObject = null;
    remoteVideoEl.srcObject = null;

    // Chat-Nachrichten löschen
    document.querySelector('#chat-messages').innerHTML = '';

    // Zustand zurücksetzen
    didIOffer = false;

    console.log('closeWebRTC()');

    hideWebRTCScreen();
    showLandingScreen();



}
