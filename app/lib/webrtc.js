// webrtc.js

import { socket } from './socket.js';
import { userName } from '../app.js';
import { showEarlyHangupButton, hideWaitingScreen, hideAnswerButton, initWaitingScreen } from '../screens/waiting/waiting_ui.js';
import { hideCallScreen } from '../screens/call/call_ui.js';
import { showHangupButton, updateUIForOptions } from '../screens/web_rtc/web_rtc_ui.js';
import { showLandingScreen } from '../screens/landing/landing_ui.js';
import { showWebRTCScreen, hideWebRTCScreen } from '../screens/web_rtc/web_rtc_ui.js';
import { markMessageAsAcked } from '../screens/web_rtc/normal/normal_ui.js';
import { peerConfiguration } from './peer_configuration.js';


import { createSession } from '../screens/web_rtc/lucis/lucis_session.js';



let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;
export let dataChannelChat;
export let dataChannelSystem;
let earlyHangup = false;

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');



export async function call(videoEnabled, audioEnabled, chatEnabled) {
    await fetchUserMedia(videoEnabled, audioEnabled);
    didIOffer = true;

    const offerOptions = {
        videoEnabled,
        audioEnabled,
        chatEnabled
    };

   await createPeerConnection(null, offerOptions);

    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('newOffer', { offer, offerOptions });

        initWaitingScreen();

        showEarlyHangupButton();
        hideCallScreen();

    } catch (err) {
        console.log(err);


    }
}

export async function cancelCall() {
    socket.emit('cancelOffer', userName);
    didIOffer = false;
    closeWebRTC();
    socket.disconnect();
    hideWaitingScreen();
    showLandingScreen();
}

export async function answerOffer(offerObj) {
    const { offer, offerOptions } = offerObj;

    await fetchUserMedia(offerOptions.videoEnabled, offerOptions.audioEnabled);
    didIOffer = false;
    await createPeerConnection(offerObj, offerOptions, userName);

    const answer = await peerConnection.createAnswer({});
    await peerConnection.setLocalDescription(answer);
    offerObj.answer = answer;

    const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj);
    offerIceCandidates.forEach(c => {
        peerConnection.addIceCandidate(c);
    });

    showHangupButton();
    hideCallScreen();
    hideAnswerButton();

    updateUIForOptions(offerOptions);
}

export async function addAnswer(offerObj) {
    await peerConnection.setRemoteDescription(offerObj.answer);
    if (earlyHangup) {
        console.log("...Angebot zurückgezogen");
    } else {
        showHangupButton();
        hideCallScreen();
        hideAnswerButton();

        updateUIForOptions(offerObj.offerOptions);
    }
}

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

function createPeerConnection(offerObj = null, options = {}) {

   // console.log('hallo');
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

        const dataChannelOptions = {
            ordered: true,
            maxRetransmits: 10
        };

        if (didIOffer) {
            dataChannelSystem = peerConnection.createDataChannel('system', dataChannelOptions);
            setupDataChannelSystem(dataChannelSystem);

            if (chatEnabled) {
                dataChannelChat = peerConnection.createDataChannel('chat', dataChannelOptions);
                setupDataChannelChat(dataChannelChat);
            }
        } else {
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

        peerConnection.addEventListener('icecandidate', e => {
            if (e.candidate) {
                socket.emit('sendIceCandidateToSignalingServer', {
                    iceCandidate: e.candidate,
                    iceUserName: userName,
                    didIOffer,
                });
            }
        });

        peerConnection.addEventListener('track', e => {
            e.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track, remoteStream);
            });
        });

        peerConnection.addEventListener('connectionstatechange', () => {
            if (peerConnection.connectionState === 'connected') {
                socket.disconnect();
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

        createSession();

       // console.log('dataChannelSystem ist offen');
    };

    channel.onmessage = (event) => {
        if (event.data === '__hangup__') {
            closeWebRTC();
        }
    };

    channel.onclose = () => {
        closeWebRTC();
        console.log('dataChannelSystem ist geschlossen');
    };

    channel.onerror = (error) => {
        //console.error('dataChannelSystem Fehler:', error);
    };
}

function setupDataChannelChat(channel) {
    channel.onopen = () => {
       // console.log('dataChannelChat ist offen');
        document.querySelector('#chat-input').disabled = false;
        document.querySelector('#send-button').disabled = false;
    };

    channel.onmessage = (event) => {
        try {
            const messageObj = JSON.parse(event.data);
            if (messageObj.type === 'message') {
                const chatMessages = document.querySelector('#chat-messages');
                const messageEl = document.createElement('div');
                messageEl.textContent = 'Remote: ' + messageObj.data;
                chatMessages.appendChild(messageEl);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                const ackObj = {
                    type: 'ack',
                    id: messageObj.id
                };
                channel.send(JSON.stringify(ackObj));
            } else if (messageObj.type === 'ack') {
                const ackedMessageId = messageObj.id;
                markMessageAsAcked(ackedMessageId);
            }
        } catch (error) {
            console.error('Fehler beim Verarbeiten der Chatnachricht:', error);
        }
    };

    channel.onclose = () => {
        document.querySelector('#chat-input').disabled = true;
        document.querySelector('#send-button').disabled = true;
    };

    channel.onerror = (error) => {
       // console.error('dataChannelChat Fehler:', error);
    };
}

export function addNewIceCandidate(iceCandidate) {
    peerConnection.addIceCandidate(iceCandidate);
}

export function hangup() {
    if (dataChannelSystem && dataChannelSystem.readyState === 'open') {
        dataChannelSystem.send('__hangup__');
    }
    closeWebRTC();
}

export async function closeWebRTC() {


    location.reload(true);
}


export async function closeWebRTC2() {
    if (dataChannelChat) {
        dataChannelChat.close();
        dataChannelChat = null;
    }
    if (dataChannelSystem) {
        dataChannelSystem.close();
        dataChannelSystem = null;
    }

    if (peerConnection) {
        try {
            peerConnection.setLocalDescription(null);
            peerConnection.close();
        } catch (error) {
            console.error('Fehler beim Schließen der Peerverbindung:', error);
        }


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

    document.querySelector('#chat-input').disabled = true;
    document.querySelector('#send-button').disabled = true;

    localVideoEl.srcObject = null;
    remoteVideoEl.srcObject = null;

    document.querySelector('#chat-messages').innerHTML = '';

    didIOffer = false;

    location.reload(true);
}
