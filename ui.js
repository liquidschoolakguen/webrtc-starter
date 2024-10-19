// ui.js

// Verwaltet die Benutzeroberfläche, einschließlich Event Listener für Buttons, Aktualisierung der UI-Elemente und Handhabung von Benutzereingaben
const userName = "User-" + Math.floor(Math.random() * 100000);
const password = "x";

function initializeUI(userName, password) {
    // Event Listener für den "Verbinde mich"-Button
    document.querySelector('#connect').addEventListener('click', initializeS);

    // Event Listener für den "Call"-Button mit Optionen
    document.querySelector('#call').addEventListener('click', () => {
        const videoEnabled = document.querySelector('#videoCheck').checked;
        const audioEnabled = document.querySelector('#audioCheck').checked;
        const chatEnabled = document.querySelector('#chatCheck').checked;

        // Rufen Sie die 'call'-Funktion mit den ausgewählten Optionen auf
        call(videoEnabled, audioEnabled, chatEnabled);
    });

    // Event Listener für den "Hangup"-Button
    document.querySelector('#hangup').addEventListener('click',  hangup);

    document.querySelector('#early-hangup').addEventListener('click', cancelCall);

    // Event Listener für den "Send"-Button
    document.querySelector('#send-button').addEventListener('click', sendMessage);

















    const inputElement = document.querySelector('#chat-input2');
    const displayElement = document.querySelector('#chat-input-display');

    inputElement.addEventListener('input', updateDisplay);
    inputElement.addEventListener('click', updateDisplay);
    inputElement.addEventListener('keyup', updateDisplay);
    inputElement.addEventListener('select', updateDisplay);

    let lastInputValue = ''; // Speichert den letzten Eingabewert

    function updateDisplay() {
      //timestamp
      const timestamp = new Date().toLocaleTimeString();
      console.log('updateDisplay', timestamp);

        const inputValue = inputElement.value;
        const cursorStart = inputElement.selectionStart;
        const cursorEnd = inputElement.selectionEnd;

        // Leere das Display-Element
        displayElement.innerHTML = '';

        // Finde das neu hinzugefügte Zeichen
        let newCharIndex = -1;
        if (inputValue.length > lastInputValue.length) {
            for (let i = 0; i < inputValue.length; i++) {
                if (i >= lastInputValue.length || inputValue[i] !== lastInputValue[i]) {
                    newCharIndex = i;
                    break;
                }
            }
        }

        // Erstelle für jedes Zeichen ein Span-Element
        for (let i = 0; i < inputValue.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.textContent = inputValue[i];

            // Markiere ausgewählten Text
            if (i >= cursorStart && i < cursorEnd) {
                charSpan.classList.add('selected');
            }

            // Füge die Klasse für den Schreibmaschineneffekt nur zum neuen Zeichen hinzu
            if (i === newCharIndex) {
                charSpan.classList.add('typewriter-char');
                // Trigger a reflow to restart the animation
                void charSpan.offsetWidth;
            }

            displayElement.appendChild(charSpan);
        }

        // Füge den blinkenden Cursor hinzu
        const cursorElement = document.createElement('span');
        cursorElement.classList.add('cursor');
        if (cursorStart === cursorEnd) {
          // Berechne die Position des Cursors von rechts

          //console.log('cursorStart', cursorStart);
          //console.log('childNodes.length', displayElement.childNodes.length);
          const cursorPosition = inputValue.length - cursorStart;

          if (cursorPosition === 0) {
              // Wenn der Cursor ganz rechts ist, fügen wir ihn am Ende ein
              //console.log('ok gleich', displayElement.childNodes[cursorPosition]);
              displayElement.appendChild(cursorElement);
          } else {
              // Ansonsten fügen wir ihn an der berechneten Position ein
              //if (cursorPosition < displayElement.childNodes.length) {
               // console.log('cursorPosition', cursorPosition);
                //console.log('insertBefore', displayElement.childNodes[displayElement.childNodes.length - cursorPosition]);
                  displayElement.insertBefore(cursorElement, displayElement.childNodes[displayElement.childNodes.length - cursorPosition]);

          }
      }

        // Aktualisiere den gespeicherten Eingabewert
        lastInputValue = inputValue;
    }

    // Behalten Sie das keypress-Event für die Enter-Taste bei
    document.querySelector('#chat-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // UI initialisieren
    createConnectButton();
    showLandingScreen();
}

// Funktion zum Senden einer Chat-Nachricht
function sendMessage() {
  const input = document.querySelector('#chat-input');
  const message = input.value;
  if (message && dataChannelChat && dataChannelChat.readyState === 'open') {
      dataChannelChat.send(message);
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
        const newOfferEl = document.createElement('button');
        newOfferEl.className = 'btn btn-success';

        // Optionen extrahieren
        let optionsText = '';
        if (o.offerOptions) {
            optionsText += o.offerOptions.videoEnabled ? 'Video ' : '';
            optionsText += o.offerOptions.audioEnabled ? 'Audio ' : '';
            optionsText += o.offerOptions.chatEnabled ? 'Chat ' : '';
        }

        newOfferEl.textContent = `Annehmen von ${o.offererUserName} (${optionsText.trim()})`;
        newOfferEl.addEventListener('click', () => answerOffer(o));
        answerEl.appendChild(newOfferEl);

        // UI aktualisieren
        hideCallWithOptions();
    });
}

function createConnectButton() {
    const connectButtonEl = document.querySelector('#connect');
    connectButtonEl.textContent = `Connect`;
}

function showLandingScreen() {
    showConnectButton();
}

function hideLandingScreen() {
    hideConnectButton();
}

function showWaitingScreen() {
    showCallWithOptions();
}

function hideWaitingScreen() {
    hideCallWithOptions();
    hideAnswerButtons();
    hideEarlyHangupButton();
}

function showWebRTCScreen() {
    showHangupButton();
    hideCallWithOptions();
    hideAnswerButtons();
    showVideoAndChat();
}

function hideWebRTCScreen() {

    hideHangupButton();


    hideVideoAndChat();
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
console.log('showVideoAndChat');
    document.querySelector('#main_screen').style.display = 'block';
    //document.querySelector('#chat').style.display = 'block';
}

function hideVideoAndChat() {
console.log('hideVideoAndChat');
    document.querySelector('#main_screen').style.display = 'none';
    //document.querySelector('#videos').style.display = 'none';
    //document.querySelector('#chat').style.display = 'none';
}

function hideAnswerButtons() {
    document.querySelector('#answer').innerHTML = '';
}

// Funktion zur Aktualisierung der UI basierend auf den Optionen
function updateUIForOptions(options) {

  console.log('updateUIForOptions: options', options);
    if (options.videoEnabled ) {
        // Video-Elemente anzeigen
        document.querySelector('#videos').style.display = 'block';
    } else {
        // Video-Elemente ausblenden
        console.log('updateUIForOptions: Video-Elemente ausblenden');
        document.querySelector('#videos').style.display = 'none';

    }

    if (options.chatEnabled) {
        // Chat-Elemente aktivieren
        document.querySelector('#chat-input').disabled = false;
        document.querySelector('#send-button').disabled = false;
        document.querySelector('#chat').style.display = 'block';
    } else {
        // Chat-Elemente deaktivieren
        document.querySelector('#chat-input').disabled = true;
        document.querySelector('#send-button').disabled = true;
        document.querySelector('#chat').style.display = 'none';
    }
}
