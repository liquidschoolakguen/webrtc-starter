// server.js

require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const socketio = require('socket.io');
app.use(express.static(__dirname));

// Arrays zur Verwaltung von Verbindungen und Angeboten
let connectedSockets = [];
let offers = [];

try {
    // Schlüssel und Zertifikat für HTTPS
    const key = fs.readFileSync(process.env.KEY_PATH);
    const cert = fs.readFileSync(process.env.CERT_PATH);

    const myConstant = process.env.URL;
    console.log(myConstant);

    // HTTPS-Server erstellen
    const expressServer = https.createServer({ key, cert }, app);

    // Socket.io-Server erstellen mit angepassten CORS-Einstellungen
    const io = socketio(expressServer, {
        cors: {
            origin: [
                process.env.URL,
            ],
            allowedHeaders: ["*"],
            credentials: true,
            methods: ["GET", "POST"],
        }
    });

    const HOST = process.env.LOCALHOST || 'localhost';
    const PORT = process.env.PORT || 8181;

    expressServer.listen(PORT, HOST, () => {
        console.log(`Server läuft auf https://${HOST}:${PORT}`);
    });

    // Socket.io Logik
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

        socket.on('newOffer', newOfferObj => {
            const { offer, offerOptions } = newOfferObj;
            const newOfferEntry = {
                offererUserName: userName,
                offer: offer,
                offerOptions: offerOptions, // Optionen speichern
                offerIceCandidates: [],
                answererUserName: null,
                answer: null,
                answererIceCandidates: []
            };
            offers.push(newOfferEntry);
            // Angebot an alle anderen Clients senden
            socket.broadcast.emit('newOfferAwaiting', [newOfferEntry]);
        });

        socket.on('cancelOffer', userName => {
            console.log("cancelOffer");
            // Entfernen des Angebots von diesem Benutzer
            offers = offers.filter(o => o.offererUserName !== userName);
            // Aktualisierte Angebote an alle anderen Clients senden
            socket.broadcast.emit('newOfferAwaiting', offers);
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
                if (offerInOffers) {
                    const socketToSendTo = connectedSockets.find(s => s.userName === offerInOffers.offererUserName);
                    if (socketToSendTo) {
                        socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer', iceCandidate);
                    } else {
                        console.log("ICE-Kandidat erhalten, aber Anrufer nicht gefunden");
                    }
                }
            }
        });

        // Bei Disconnect aufräumen
        socket.on('disconnect', () => {
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

    app.get('/favicon.ico', (req, res) => res.status(204));

} catch (err) {
    console.error('Fehler beim Starten des Servers:', err);
    process.exit(1);
}
