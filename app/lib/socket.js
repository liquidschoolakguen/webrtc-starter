// socket.js


import { _app } from '../app.js';
import { addAnswer, addNewIceCandidate, closeWebRTC } from './webrtc/create.js';
import { showAnswerButton, hideWaitingScreen } from '../screens/waiting/waiting_ui.js';
import { showLandingScreen, hideLandingScreen } from '../screens/landing/landing_ui.js';
import { showCallScreen, hideCallScreen } from '../screens/call/call_ui.js';



import { debug } from '../app.js';

export let socket;

export async function initSocket() {

    try {

        socket = io({
            auth: {
                userName: _app.meUser.userName, password: "x", debug
            },
            secure: true,
            transports: ['websocket', 'polling']
        });

        socket.on('availableOffers', offers => {

           // return {event: "availableOffers", offers: offers};
            showAnswerButton(offers);
            hideCallScreen();
        });

        socket.on('newOfferAwaiting', offers => {
            //console.log("newOfferAwaiting", offers);
            if (offers.length > 0) {
                //return {event: "newOfferAwaiting", offers: offers};
                showAnswerButton(offers);
                hideCallScreen();
            } else {
                console.log("Keine Angebote mehr vorhanden");
                socket.disconnect();
                closeWebRTC();
                //return {event: "noOffersLeft"};
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


        console.log("socket initialized");



        if (!debug) {
            hideLandingScreen();
            showCallScreen();
        }


    } catch (err) {
        console.error('Fehler beim Herstellen der Socket-Verbindung:', err);

    }
}
