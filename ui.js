// ui.js

// Verwaltet die Benutzeroberfläche, einschließlich Event Listener für Buttons, Aktualisierung der UI-Elemente und Handhabung von Benutzereingaben
const userName = "User-" + Math.floor(Math.random() * 100000);
const password = "x";

let isRecording = false;
let recordedActions = [];

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
  document.querySelector('#hangup').addEventListener('click', hangup);

  document.querySelector('#early-hangup').addEventListener('click', cancelCall);

  // Event Listener für den "Send"-Button
  document.querySelector('#send-button').addEventListener('click', sendMessage);

  document.querySelector('#record-btn').addEventListener('click', startRecord);
  document.querySelector('#stop-btn').addEventListener('click', stopRecord);
  document.querySelector('#play-btn').addEventListener('click', playRecord);



  function startRecord() {
    document.querySelector('#chat-input2').disabled = false;
    isRecording = true;
    recordedActions = [];
  }

  function stopRecord() {
    document.querySelector('#chat-input2').disabled = true;
    isRecording = false;
  }

  function playRecord() {
    if (recordedActions.length === 0) return;

    const recordDisplay = document.querySelector('#chat-record-display');
    recordDisplay.innerHTML = '';
    let currentIndex = 0;
    const startTime = recordedActions[0].timestamp;

    function playNextAction() {
      if (currentIndex >= recordedActions.length) {
        return; // Wiedergabe beendet
      }

      const action = recordedActions[currentIndex];
      const delay = action.timestamp - (currentIndex > 0 ? recordedActions[currentIndex - 1].timestamp : startTime);

      setTimeout(() => {
        updateDisplay(action.value, action.cursorStart, action.cursorEnd, recordDisplay);
        currentIndex++;
        playNextAction();
      }, delay);
    }

    playNextAction();
  }















  const inputElement = document.querySelector('#chat-input2');
  const displayElement = document.querySelector('#chat-input-display');

  inputElement.addEventListener('input', fire);
  inputElement.addEventListener('click', fire);
  inputElement.addEventListener('keyup', fire);
  inputElement.addEventListener('select', fire);

function fire(){

  inputValue = inputElement.value;
  cursorStart = inputElement.selectionStart;
  cursorEnd = inputElement.selectionEnd;

  updateDisplay(inputValue, cursorStart, cursorEnd);
}




  let lastInputValue = ''; // Speichert den letzten Eingabewert


  function updateDisplay(inputValue, cursorStart, cursorEnd, targetElement = displayElement) {
    //console.log('updateDisplay', inputValue, cursorStart, cursorEnd);


   // Leere das Display-Element
   targetElement.innerHTML = '';

   // Finde die neu hinzugefügten Zeichen
   let newCharIndices = [];
   if (inputValue.length > lastInputValue.length) {
     let firstDiff = -1;
     for (let i = 0; i < inputValue.length; i++) {
       if (i >= lastInputValue.length || inputValue[i] !== lastInputValue[i]) {
         firstDiff = i;
         break;
       }
     }
     if (firstDiff !== -1) {
       let numAdded = inputValue.length - lastInputValue.length;
       for (let i = firstDiff; i < firstDiff + numAdded && i < inputValue.length; i++) {
         newCharIndices.push(i);
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

     // Füge die Klasse für den Schreibmaschineneffekt zu allen neuen Zeichen hinzu
     if (newCharIndices.includes(i)) {
       charSpan.classList.add('typewriter-char');
       // Trigger a reflow to restart the animation
       void charSpan.offsetWidth;
     }

     targetElement.appendChild(charSpan);
   }

   // Füge den blinkenden Cursor hinzu
   const cursorElement = document.createElement('span');
   cursorElement.classList.add('cursor');
   if (cursorStart === cursorEnd) {
     // Berechne die Position des Cursors von rechts
     const cursorPosition = inputValue.length - cursorStart;

     if (cursorPosition === 0) {
       // Wenn der Cursor ganz rechts ist, fügen wir ihn am Ende ein
       targetElement.appendChild(cursorElement);
     } else {
       // Ansonsten fügen wir ihn an der berechneten Position ein
       targetElement.insertBefore(
         cursorElement,
         targetElement.childNodes[targetElement.childNodes.length - cursorPosition]
       );
     }
   }

   // Aktualisiere den gespeicherten Eingabewert
   lastInputValue = inputValue;

   // Wenn wir aufnehmen, speichere die Aktion
   if (isRecording && targetElement === displayElement) {
     recordedActions.push({
       value: inputValue,
       cursorStart: cursorStart,
       cursorEnd: cursorEnd,
       timestamp: Date.now()
     });
   }
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

// ui.js

function sendMessage() {
  const input = document.querySelector('#chat-input');
  const messageText = input.value.trim();
  if (messageText && dataChannelChat && dataChannelChat.readyState === 'open') {
    const messageId = generateUniqueId();
    const messageObj = {
      type: 'message',
      id: messageId,
      data: messageText
    };

    // Sende die Nachricht als JSON-String
    dataChannelChat.send(JSON.stringify(messageObj));

    // Füge die Nachricht zum UI hinzu und speichere die Referenz
    const chatMessages = document.querySelector('#chat-messages');
    const messageEl = document.createElement('div');
    messageEl.id = messageId; // Setze die ID für spätere Referenz
    messageEl.textContent = 'You: ' + messageText;
    messageEl.style.color = 'black'; // Standardfarbe
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Speichere die Nachricht für spätere Aktualisierungen
    sentMessages[messageId] = messageEl;

    // Leere das Eingabefeld
    input.value = '';
  }
}



// ui.js

// Funktion zum Markieren einer Nachricht als bestätigt
function markMessageAsAcked(messageId) {
  const messageEl = sentMessages[messageId];
  if (messageEl) {
    messageEl.style.color = 'red'; // Ändere die Schriftfarbe zu Grün
    // Optional: Entferne die Nachricht aus dem Tracking-Objekt
    delete sentMessages[messageId];
  }
}

// ui.js

// Stelle die Funktion global zur Verfügung
//window.markMessageAsAcked = markMessageAsAcked;




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
  if (options.videoEnabled) {
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


// ui.js

// Eindeutige ID für jede Nachricht generieren
function generateUniqueId() {
  return 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}

// Objekt zur Verfolgung gesendeter Nachrichten
const sentMessages = {};
