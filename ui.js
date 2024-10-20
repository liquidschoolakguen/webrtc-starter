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










  const inputElement = document.querySelector('#chat-input2');


  const displayElement = document.querySelector('#display');
  const displayElementOld = document.querySelector('#display-old');


  const recordDisplayElement = document.querySelector('#record-display');
  const recordDisplayElementOld = document.querySelector('#record-display-old');






  let lastValue = '';
let lastSelectionStart = 0;
let lastSelectionEnd = 0;

function checkChanges(event) {
  const currentValue = inputElement.value;
  const currentSelectionStart = inputElement.selectionStart;
  const currentSelectionEnd = inputElement.selectionEnd;

  if (currentValue !== lastValue ||
      currentSelectionStart !== lastSelectionStart ||
      currentSelectionEnd !== lastSelectionEnd) {

    // Werte haben sich geändert, rufe fire() auf
    fire();
    if (isRecording) {
      record(currentValue, currentSelectionStart, currentSelectionEnd);
    }

    // Aktualisiere die gespeicherten Werte
    lastValue = currentValue;
    lastSelectionStart = currentSelectionStart;
    lastSelectionEnd = currentSelectionEnd;
  }
}

// Füge einen einzelnen Event-Listener hinzu
inputElement.addEventListener('input', checkChanges);
inputElement.addEventListener('click', checkChanges);
inputElement.addEventListener('keyup', checkChanges);
inputElement.addEventListener('select', checkChanges);














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


    recordDisplayElement.innerHTML = '';
    let currentIndex = 0;
    const startTime = recordedActions[0].timestamp;

    function playNextAction() {
      if (currentIndex >= recordedActions.length) {
        return; // Wiedergabe beendet
      }

      const action = recordedActions[currentIndex];
      const delay = action.timestamp - (currentIndex > 0 ? recordedActions[currentIndex - 1].timestamp : startTime);

      setTimeout(() => {
        fire(action.value, action.cursorStart, action.cursorEnd, recordDisplayElement);
        currentIndex++;
        playNextAction();
      }, delay);
    }

    playNextAction();
  }











  function fire(inputValue, cursorStart, cursorEnd, targetElement = displayElement) {
    //console.log('fire')

    inputValue = inputValue? cutSentence(inputValue, recordDisplayElementOld ) : cutSentence(inputElement.value, displayElementOld);
    cursorStart = cursorStart? cursorStart : inputElement.selectionStart;
    cursorEnd = cursorEnd? cursorEnd : inputElement.selectionEnd;

    updateDisplay(inputValue, cursorStart, cursorEnd, targetElement);
  }



  let lastInputValue = ''; // Speichert den letzten Eingabewert






  function cutSentence(inputValue, targetElement) {

    let separator= ' ';
    // Finde die Position des letzten Punktes, Ausrufezeichens oder Fragezeichens
    //const lastDotIndex = inputValue.lastIndexOf('.');
    //const lastExclamationIndex = inputValue.lastIndexOf('!');
    //const lastQuestionIndex = inputValue.lastIndexOf('?');

    const maxInputValueLength = 50;
    let firstSpaceIndex = -1;


    // überprüfe ob die Eingabe zu lang ist
    if (inputValue.length > maxInputValueLength) {
      //gebe mir den Index des ersten Leerzeichens vor maxInputValueLength
      firstSpaceIndex = inputValue.indexOf(' ')==-1? 0 :inputValue.indexOf(' ');
      console.log('firstSpaceIndex', firstSpaceIndex)
      //console.log('inputValue', inputValue.lastIndexOf(' '))
      separator = '';
     // inputValue = inputValue.substring(0, lastSpaceIndex + 1);
    }


    // Wenn eines der Satzzeichen gefunden wurde, gib den Text danach zurück
    if (firstSpaceIndex !== -1) {
      console.log('cutSentence', targetElement)
      updateDisplayOldSentences(inputValue.substring(0, firstSpaceIndex + 1)+separator, targetElement)
      inputElement.value = inputValue.substring(firstSpaceIndex + 1)
      return inputValue.substring(firstSpaceIndex + 1);
    }

    // Wenn kein Satzzeichen gefunden wurde, gib den ursprünglichen Text zurück
    return inputValue;
  }






  function updateDisplayOldSentences(inputValue, targetElement = displayElementOld) {
    console.log('old ', targetElement)
    // Erstelle für jedes Zeichen ein Span-Element
    for (let i = 0; i < inputValue.length; i++) {
      const charSpan = document.createElement('span');
      charSpan.textContent = inputValue[i];
      //charSpan.classList.add('old-sentence');



      targetElement.appendChild(charSpan);
    }



  }



function record(inputValue, cursorStart, cursorEnd) {


    recordedActions.push({
      value: inputValue,
      cursorStart: cursorStart,
      cursorEnd: cursorEnd,
      timestamp: Date.now()
    });


}






let lastText = '';
let lastCursorStart = 0;
let lastCursorEnd = 0;

function getManipulation(newText, cursorStart, cursorEnd) {
  const manipulation = {
    type: '', // 'add', 'delete', 'select', 'replace', 'none'
    diff: '', // Unterschied seit der letzten Manipulation von "text"
    position: 0, // Position, an der die Änderung stattgefunden hat
  };

  if (cursorStart !== cursorEnd) {
    // Benutzer hat Text ausgewählt
    manipulation.type = 'select';
    manipulation.diff = newText.slice(cursorStart, cursorEnd);
    manipulation.position = cursorStart;
  } else if (lastCursorStart !== lastCursorEnd) {
    // Es gab eine vorherige Auswahl, prüfen ob diese ersetzt wurde
    const deletedText = lastText.slice(lastCursorStart, lastCursorEnd);
    const addedTextLength =
      newText.length - (lastText.length - (lastCursorEnd - lastCursorStart));
    const addedText = newText.slice(
      lastCursorStart,
      lastCursorStart + addedTextLength
    );

    manipulation.type = 'replace';
    manipulation.diff = {
      deleted: deletedText,
      added: addedText,
    };
    manipulation.position = lastCursorStart;
  } else {
    // Bestimmen, welche Art von Manipulation stattgefunden hat
    let start = 0;
    while (
      start < lastText.length &&
      start < newText.length &&
      lastText[start] === newText[start]
    ) {
      start++;
    }

    let endLast = lastText.length - 1;
    let endNew = newText.length - 1;
    while (
      endLast >= start &&
      endNew >= start &&
      lastText[endLast] === newText[endNew]
    ) {
      endLast--;
      endNew--;
    }

    const lastDiff = lastText.slice(start, endLast + 1);
    const newDiff = newText.slice(start, endNew + 1);

    if (newDiff.length > 0 && lastDiff.length === 0) {
      manipulation.type = 'add';
      manipulation.diff = newDiff;
      manipulation.position = start;
    } else if (newDiff.length === 0 && lastDiff.length > 0) {
      manipulation.type = 'delete';
      manipulation.diff = lastDiff;
      manipulation.position = start;
    } else if (newDiff.length > 0 && lastDiff.length > 0) {
      manipulation.type = 'replace';
      manipulation.diff = {
        deleted: lastDiff,
        added: newDiff,
      };
      manipulation.position = start;
    } else {
      manipulation.type = 'none';
      manipulation.diff = '';
      manipulation.position = cursorStart;
    }
  }

  // Aktualisiere lastText und Cursorpositionen für den nächsten Aufruf
  lastText = newText;
  lastCursorStart = cursorStart;
  lastCursorEnd = cursorEnd;

  return manipulation;
}






  function updateDisplay(inputValue, cursorStart, cursorEnd, targetElement) {

    const mini = getManipulation(inputValue, cursorStart, cursorEnd)
    console.log(mini)

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
window.markMessageAsAcked = markMessageAsAcked;




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
