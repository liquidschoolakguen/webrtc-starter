// ui.js

// Verwaltet die Benutzeroberfläche, einschließlich Event Listener für Buttons, Aktualisierung der UI-Elemente und Handhabung von Benutzereingaben
const userName = "User-" + Math.floor(Math.random() * 100000);
const password = "x";

function initializeUI(userName, password) {
  // Benutzername und Passwort festlegen

  //document.querySelector('#user-name').innerHTML = userName;
  // Event Listener für den "Verbinde mich"-Button
  document.querySelector('#connect').addEventListener('click', initializeS);

  // Event Listener für die neuen Call-Buttons
  document.querySelector('#call').addEventListener('click', call);



  // Event Listener für den "Hangup"-Button
  document.querySelector('#hangup').addEventListener('click', () => hangup(true));

  document.querySelector('#early-hangup').addEventListener('click', cancelCall);

  // Event Listener für den "Send"-Button
  document.querySelector('#send-button').addEventListener('click', sendMessage);

  // Optional: Nachrichten mit der Eingabetaste senden
  document.querySelector('#chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // UI initialisieren
  createConnectButton();
  showLandingScreen()
  //showConnectButton();
  // hideCallOptions();
  // hideHangupButton();
  // hideVideoAndChat();
  // hideAnswerButtons();
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
    //console.log(o);
    const newOfferEl = document.createElement('button');
    newOfferEl.className = 'btn btn-success';
    //newOfferEl.textContent = `Answer ${o.offererUserName}`;
    newOfferEl.textContent = `Ok, jetzt nochmal clicken, dann kommt Mithat`;
    newOfferEl.addEventListener('click', () => answerOffer(o));
    answerEl.appendChild(newOfferEl);

    // UI aktualisieren
    hideCallWithOptions();
    //hideHangupButton();
    //hideVideoAndChat();
    //hideConnectButton();
  });
}


function createConnectButton() {
  // Antwortbereich leeren
  const connectButtonEl = document.querySelector('#connect');
  connectButtonEl.textContent = `Connect`;

}

function showLandingScreen(){
showConnectButton();
}

function hideLandingScreen(){
hideConnectButton();
}


function showWaitingScreen(){
  showCallWithOptions()
}

function hideWaitingScreen(){
  hideCallWithOptions();
  hideAnswerButtons();
  hideEarlyHangupButton();
}





function showWebRTCScreen(){
  showHangupButton();
  hideCallWithOptions();
  hideAnswerButtons();
  showVideoAndChat();
}

function hideWebRTCScreen(){
hideVideoAndChat();
hideHangupButton();
}


// UI-Helper-Funktionen
function showConnectButton() {
  document.querySelector('#connect').style.display = 'inline-block';
}

function hideConnectButton() {
  document.querySelector('#connect').style.display = 'none';
}

function showCallWithOptions() {
  document.querySelector('#callWithOptions').style.display = 'inline-block';

}

function hideCallWithOptions() {
  document.querySelector('#callWithOptions').style.display = 'none';

}


function showHangupButton() {
  document.querySelector('#hangup').style.display = 'inline-block';
}

function hideHangupButton() {
  document.querySelector('#hangup').style.display = 'none';
}

function showEarlyHangupButton() {
  document.querySelector('#early-hangup').style.display = 'inline-block';
}

function hideEarlyHangupButton() {
  document.querySelector('#early-hangup').style.display = 'none';
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
