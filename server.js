// server.js

const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const socketio = require('socket.io');
app.use(express.static(__dirname));

// Schlüssel und Zertifikat für HTTPS
const key = fs.readFileSync('cert.key');
const cert = fs.readFileSync('cert.crt');

// HTTPS-Server erstellen
const expressServer = https.createServer({ key, cert }, app);
// Socket.io-Server erstellen
const io = socketio(expressServer, {
    cors: {
        origin: [
            "https://localhost",
            "https://192.168.146.225", // Redmi Hotspot
            'https://10.11.11.148',    // Krankenhaus WLAN
        ],
        allowedHeaders: ["*"],
        credentials: true,
        methods: ["GET", "POST"],
    }
});
expressServer.listen(8181, '127.0.0.1', () => {
    console.log('Server läuft auf https://localhost:8181');
});

// Angebote und verbundene Sockets verwalten
const offers = [];
const connectedSockets = [];

io.on('connection', (socket) => {
    const userName = socket.handshake.auth.userName;
    const password = socket.handshake.auth.password;

    if (password !== "x") {
        socket.disconnect(true);
        return;
    }
    connectedSockets.push({
        socketId: socket.id,
        userName
    });

    // Verfügbare Angebote an neuen Client senden
    if (offers.length) {
        socket.emit('availableOffers', offers);
    }

    socket.on('newOffer', newOffer => {
        offers.push({
            offererUserName: userName,
            offer: newOffer,
            offerIceCandidates: [],
            answererUserName: null,
            answer: null,
            answererIceCandidates: []
        });
        // Angebot an alle anderen Clients senden
        socket.broadcast.emit('newOfferAwaiting', offers.slice(-1));
    });

    socket.on('newAnswer', async (offerObj, ackFunction) => {
        const socketToAnswer = connectedSockets.find(s => s.userName === offerObj.offererUserName);
        if (!socketToAnswer) {
            console.log("Kein passender Socket gefunden");
            return;
        }
        const socketIdToAnswer = socketToAnswer.socketId;
        const offerToUpdate = offers.find(o => o.offererUserName === offerObj.offererUserName);
        if (!offerToUpdate) {
            console.log("Kein passendes Angebot gefunden");
            return;
        }
        // ICE-Kandidaten an den Antwortenden zurücksenden
        ackFunction(offerToUpdate.offerIceCandidates);
        offerToUpdate.answer = offerObj.answer;
        offerToUpdate.answererUserName = userName;
        // Antwort an den Anrufer senden
        socket.to(socketIdToAnswer).emit('answerResponse', offerToUpdate);
    });

    socket.on('sendIceCandidateToSignalingServer', iceCandidateObj => {
        const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
        if (didIOffer) {
            // ICE-Kandidat vom Anrufer
            const offerInOffers = offers.find(o => o.offererUserName === iceUserName);
            if (offerInOffers) {
                offerInOffers.offerIceCandidates.push(iceCandidate);
                if (offerInOffers.answererUserName) {
                    const socketToSendTo = connectedSockets.find(s => s.userName === offerInOffers.answererUserName);
                    if (socketToSendTo) {
                        socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer', iceCandidate);
                    } else {
                        console.log("ICE-Kandidat erhalten, aber Antwortender nicht gefunden");
                    }
                }
            }
        } else {
            // ICE-Kandidat vom Antwortenden
            const offerInOffers = offers.find(o => o.answererUserName === iceUserName);
            const socketToSendTo = connectedSockets.find(s => s.userName === offerInOffers.offererUserName);
            if (socketToSendTo) {
                socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer', iceCandidate);
            } else {
                console.log("ICE-Kandidat erhalten, aber Anrufer nicht gefunden");
            }
        }
    });

    // Hangup-Ereignis wird nicht mehr über Socket behandelt

    // Bei Disconnect aufräumen
    socket.on('disconnect', () => {
        console.log(`Benutzer ${userName} hat die Verbindung getrennt`);
        const index = connectedSockets.findIndex(s => s.socketId === socket.id);
        if (index !== -1) {
            connectedSockets.splice(index, 1);
        }
        const offerIndex = offers.findIndex(o => o.offererUserName === userName || o.answererUserName === userName);
        if (offerIndex !== -1) {
            offers.splice(offerIndex, 1);
        }
    });
});
