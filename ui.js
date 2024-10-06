// ui.js

// Verwaltet die Benutzeroberfläche, einschließlich Event Listener für Buttons, Aktualisierung der UI-Elemente und Handhabung von Benutzereingaben

function initializeUI() {
  // Event Listener für den "Verbinde mich"-Button
  document.querySelector('#connect').addEventListener('click', async () => {
      try {
          // Socket-Verbindung herstellen
          await initializeSocket(userName, password);
          // UI aktualisieren
          hideConnectButton();
          showCallButton();
      } catch (err) {
          console.error('Fehler beim Herstellen der Socket-Verbindung:', err);
      }
  });

  // Event Listener für den "Call"-Button
  document.querySelector('#call').addEventListener('click', call);

  // Event Listener für den "Hangup"-Button
  document.querySelector('#hangup').addEventListener('click', () => hangup(true));

  // Event Listener für den "Send"-Button
  document.querySelector('#send-button').addEventListener('click', sendMessage);

  // Optional: Nachrichten mit der Eingabetaste senden
  document.querySelector('#chat-input').addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
          sendMessage();
      }
  });

  // UI initialisieren
  showConnectButton();
  hideCallButton();
  hideHangupButton();
  hideVideoAndChat();
  hideAnswerButtons();
}

// Funktion zum Senden einer Chat-Nachricht
function sendMessage() {
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
}

// Funktion zum Erstellen von Antwort-Buttons für Angebote
function createOfferEls(offers) {
  // Antwortbereich leeren
  const answerEl = document.querySelector('#answer');
  answerEl.innerHTML = '';
  offers.forEach(o => {
      console.log(o);
      const newOfferEl = document.createElement('button');
      newOfferEl.className = 'btn btn-success';
      newOfferEl.textContent = `Answer ${o.offererUserName}`;
      newOfferEl.addEventListener('click', () => answerOffer(o));
      answerEl.appendChild(newOfferEl);

      // UI aktualisieren
      hideCallButton();
      hideHangupButton();
      hideVideoAndChat();
      hideConnectButton();
  });
}

// UI-Helper-Funktionen
function showConnectButton() {
  document.querySelector('#connect').style.display = 'inline-block';
}

function hideConnectButton() {
  document.querySelector('#connect').style.display = 'none';
}

function showCallButton() {
  document.querySelector('#call').style.display = 'inline-block';
}

function hideCallButton() {
  document.querySelector('#call').style.display = 'none';
}

function showHangupButton() {
  document.querySelector('#hangup').style.display = 'inline-block';
}

function hideHangupButton() {
  document.querySelector('#hangup').style.display = 'none';
}

function showVideoAndChat() {
  document.querySelector('#videos').style.display = 'block';
  document.querySelector('#chat').style.display = 'block';
}

function hideVideoAndChat() {
  document.querySelector('#videos').style.display = 'none';
  document.querySelector('#chat').style.display = 'none';
}

function hideAnswerButtons() {
  document.querySelector('#answer').innerHTML = '';
}
