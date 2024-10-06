const userName = "Rob-" + Math.floor(Math.random() * 100000);
const password = "x";
document.querySelector('#user-name').innerHTML = userName;

//if trying it on a phone, use this instead...
const socket = io.connect('https://192.168.146.225:8181/', {
    auth: {
        userName, password
    }
});

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;
let dataChannel;

let peerConfiguration = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302'
            ]
        }
    ]
};

const call = async e => {
    await fetchUserMedia();
    didIOffer = true;
    await createPeerConnection();

    try {
        console.log("Creating offer...");
        const offer = await peerConnection.createOffer();
        console.log(offer);
        await peerConnection.setLocalDescription(offer);
        socket.emit('newOffer', offer); //send offer to signalingServer
    } catch (err) {
        console.log(err);
    }
};

const answerOffer = async (offerObj) => {
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
        console.log("======Added Ice Candidate======");
    });
    console.log(offerIceCandidates);
};

const addAnswer = async (offerObj) => {
    await peerConnection.setRemoteDescription(offerObj.answer);
};

const fetchUserMedia = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                // audio: true,
            });
            localVideoEl.srcObject = stream;
            localStream = stream;
            resolve();
        } catch (err) {
            console.log(err);
            reject();
        }
    });
};

const createPeerConnection = (offerObj) => {
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
            console.log('........Ice candidate found!......');
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
            console.log("Got a track from the other peer!! How exciting");
            console.log(e);
            e.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track, remoteStream);
                console.log("Here's an exciting moment... fingers crossed");
            });
        });

        if (offerObj) {
            await peerConnection.setRemoteDescription(offerObj.offer);
        }
        resolve();
    });
};

function setupDataChannel() {
    dataChannel.onopen = () => {
        console.log('Data channel is open');
        document.querySelector('#chat-input').disabled = false;
        document.querySelector('#send-button').disabled = false;
    };

    dataChannel.onmessage = (event) => {
        console.log('Received message:', event.data);
        const chatMessages = document.querySelector('#chat-messages');
        const messageEl = document.createElement('div');
        messageEl.textContent = 'Remote: ' + event.data;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    dataChannel.onclose = () => {
        console.log('Data channel is closed');
        document.querySelector('#chat-input').disabled = true;
        document.querySelector('#send-button').disabled = true;
    };

    dataChannel.onerror = (error) => {
        console.error('Data channel error:', error);
    };
}

const addNewIceCandidate = iceCandidate => {
    peerConnection.addIceCandidate(iceCandidate);
    console.log("======Added Ice Candidate======");
};

const hangup = () => {
    console.log('Ending call');
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
    // Deaktiviere die Chat-UI-Elemente
    document.querySelector('#chat-input').disabled = true;
    document.querySelector('#send-button').disabled = true;
    // Leere die Video-Elemente
    localVideoEl.srcObject = null;
    remoteVideoEl.srcObject = null;
    // Entferne alle Chat-Nachrichten
    document.querySelector('#chat-messages').innerHTML = '';
    // Setze den Zustand zurück
    didIOffer = false;
    console.log('Call ended');
};



// Event Listener für den "Call"-Button
document.querySelector('#call').addEventListener('click', call);

// Event Listener für den "Hangup"-Button
document.querySelector('#hangup').addEventListener('click', hangup);

document.querySelector('#send-button').addEventListener('click', () => {
    const input = document.querySelector('#chat-input');
    const message = input.value;
    if (message && dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(message);
        const chatMessages = document.querySelector('#chat-messages');
        const messageEl = document.createElement('div');
        messageEl.textContent = 'You: ' + message;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        input.value = '';
    }
});

document.querySelector('#chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.querySelector('#send-button').click();
    }
});
