// webrtc.js

import { socket } from '../socket.js';
import { _app  } from '../../app.js';
import { showEarlyHangupButton, hideWaitingScreen, hideAnswerButton, initWaitingScreen } from '../../screens/waiting/waiting_ui.js';
import { hideCallScreen } from '../../screens/call/call_ui.js';
import { showHangupButton, updateUIForOptions } from '../../screens/web_rtc/web_rtc_ui.js';
import { showLandingScreen } from '../../screens/landing/landing_ui.js';
import { showWebRTCScreen } from '../../screens/web_rtc/web_rtc_ui.js';
import { peerConfiguration } from './peer_configuration.js';
import { setupDataChannelSystem } from './data_cannels/system.js';
import { setupDataChannelChat } from './data_cannels/chat.js';
import { setupDataChannelLucis } from './data_cannels/lucis.js';





 let localStream;
 let remoteStream;
 let peerConnection;
export let didIOffer = false;
export let dataChannelChat;
export let dataChannelSystem;
export let dataChannelLucis;
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
    socket.emit('cancelOffer', _app.meUser.userName);
    didIOffer = false;
    await closeWebRTC();
    socket.disconnect();
    hideWaitingScreen();
    showLandingScreen();
}

export async function answerOffer(offerObj) {
    const { offer, offerOptions } = offerObj;

    await fetchUserMedia(offerOptions.videoEnabled, offerOptions.audioEnabled);
    didIOffer = false;
    await createPeerConnection(offerObj, offerOptions, _app.meUser.userName);

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

            if (chatEnabled) {
                dataChannelLucis = peerConnection.createDataChannel('lucis', dataChannelOptions);
                setupDataChannelLucis(dataChannelLucis);
            }
        } else {
            peerConnection.ondatachannel = event => {
                if (event.channel.label === 'system') {
                    dataChannelSystem = event.channel;
                    setupDataChannelSystem(dataChannelSystem);
                } else if (event.channel.label === 'chat') {
                    dataChannelChat = event.channel;
                    setupDataChannelChat(dataChannelChat);
                } else if (event.channel.label === 'lucis') {
                    dataChannelLucis = event.channel;
                    setupDataChannelLucis(dataChannelLucis);
                }
            };
        }

        peerConnection.addEventListener('icecandidate', e => {
            if (e.candidate) {
                socket.emit('sendIceCandidateToSignalingServer', {
                    iceCandidate: e.candidate,
                    iceUserName: _app.meUser.userName,
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




export function addNewIceCandidate(iceCandidate) {
    peerConnection.addIceCandidate(iceCandidate);
}






export async function closeWebRTC() {
    return new Promise((resolve, reject) => {
      try {
        if (dataChannelChat) {
          dataChannelChat.close();
        }
        if (dataChannelSystem) {
          dataChannelSystem.close();
        }
        if (dataChannelLucis) {
          dataChannelLucis.close();
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

        //location.reload(true);

        // Anstatt die Variablen direkt zu null zu setzen,
        // könnten Sie eine Funktion in create.js aufrufen, die dies tut
        resetDataChannels();

        resolve();
      } catch (error) {
        console.error('Fehler beim Schließen der WebRTC-Verbindung:', error);
        reject(error);
      }
    });
  }

  // In create.js fügen Sie diese Funktion hinzu:
  export function resetDataChannels() {
    dataChannelChat = null;
    dataChannelSystem = null;
    dataChannelLucis = null;
  }
