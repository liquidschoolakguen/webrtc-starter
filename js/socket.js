// socket.js

import { createOfferEls, hideWaitingScreen, showWaitingScreen, hideLandingScreen, showLandingScreen } from './ui.js';
import { addAnswer, addNewIceCandidate } from './webrtc.js';

export let socket;

export async function initializeS(userName, password) {
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
    socket = io({
        auth: {
            userName, password
        },
        secure: true,
        transports: ['websocket', 'polling']
    });

    setupSocketEvents();
    console.log("socket initialized");
}

function setupSocketEvents() {
    socket.on('availableOffers', offers => {
        createOfferEls(offers);
    });

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

    socket.on('answerResponse', offerObj => {
        if (offerObj.answer) {
            addAnswer(offerObj);
        } else {
            console.log("Antwort nicht vorhanden");
        }
    });

    socket.on('receivedIceCandidateFromServer', iceCandidate => {
        addNewIceCandidate(iceCandidate);
    });

    socket.on('disconnect', (reason) => {
        console.log('socket.disconnect()');
    });

    socket.on('connect', () => {
        // Verbindung zum Server hergestellt
    });
}
