// webrtc.js

// WebRTC-bezogene Funktionen, wie das Erstellen und Verwalten der Peer-Verbindung, Handling von MediaStreams und DataChannels

let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;
let dataChannel;

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

const peerConfiguration = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302'
            ]
        }
    ]
};

function initializeWebRTC() {
    // Initialisierung, falls erforderlich
}

// Funktion zum Starten eines Anrufs
async function call() {
    await fetchUserMedia();
    didIOffer = true;
    await createPeerConnection();

    try {
        console.log("Erstelle Angebot...");
        const offer = await peerConnection.createOffer();
        console.log(offer);
        await peerConnection.setLocalDescription(offer);
        socket.emit('newOffer', offer); // Angebot an Signalisierungsserver senden

        // UI aktualisieren
        showHangupButton();
        hideCallButton();
    } catch (err) {
        console.log(err);
    }
}

// Funktion zum Beantworten eines Angebots
async function answerOffer(offerObj) {
    await fetchUserMedia();
    didIOffer = false;
    await createPeerConnection(offerObj);
    const answer = await peerConnection.createAnswer({});
    await peerConnection.setLocalDescription(answer);
    console.log(offerObj);
    console.log(answer);
    offerObj.answer = answer;
    const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj);
    offerIceCandidates.forEach(c => {
        peerConnection.addIceCandidate(c);
        console.log("====== ICE-Kandidat hinzugefügt ======");
    });
    console.log(offerIceCandidates);

    // UI aktualisieren
    showHangupButton();
    hideCallButton();
    hideAnswerButtons();
}

// Funktion zum Hinzufügen einer Antwort
async function addAnswer(offerObj) {
    await peerConnection.setRemoteDescription(offerObj.answer);

    // UI aktualisieren
    showHangupButton();
    hideCallButton();
    hideAnswerButtons();
}

// Funktion zum Abrufen des lokalen Medienstreams
function fetchUserMedia() {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                 audio: true,
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
            console.log(event);
            console.log(peerConnection.signalingState);
        });

        peerConnection.addEventListener('icecandidate', e => {
            console.log('........ ICE-Kandidat gefunden! ......');
            console.log(e);
            if (e.candidate) {
                socket.emit('sendIceCandidateToSignalingServer', {
                    iceCandidate: e.candidate,
                    iceUserName: userName,
                    didIOffer,
                });
            }
        });

        peerConnection.addEventListener('track', e => {
            console.log("Empfange Track vom anderen Peer!");
            console.log(e);
            e.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track, remoteStream);
                console.log("Track erfolgreich hinzugefügt");
            });
        });

        peerConnection.addEventListener('connectionstatechange', () => {
            if (peerConnection.connectionState === 'connected') {
                console.log('Peers connected!');
                // Socket-Verbindung schließen
                socket.disconnect();
                console.log('Socket-Verbindung geschlossen');

                // UI aktualisieren
                showHangupButton();
                hideCallButton();
                hideAnswerButtons();
                showVideoAndChat();
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
        console.log('DataChannel ist offen');
        document.querySelector('#chat-input').disabled = false;
        document.querySelector('#send-button').disabled = false;
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
    console.log("====== ICE-Kandidat hinzugefügt ======");
}

// Funktion zum Beenden des Anrufs
function hangup(sendSignal = true) {
    console.log('Beende Anruf');

    // Hangup-Nachricht über DataChannel senden, bevor er geschlossen wird
    if (sendSignal && dataChannel && dataChannel.readyState === 'open') {
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
    hideHangupButton();
    hideVideoAndChat();
    showCallButton();
}
