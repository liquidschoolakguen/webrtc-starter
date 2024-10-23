








function startRecording() {
  document.querySelector('#chat-input2').disabled = false;

  let c = s.current_cycle;
  c.startRecordTime = Date.now();

  c.current_state.ui_state.displayElInnerHtml = displayElement.innerHTML;
  c.current_state.ui_state.displayElOldInnerHtml = displayElementOld.innerHTML;

}
function stopRecording() {
  document.querySelector('#chat-input2').disabled = true;

  let c = s.current_cycle;
  c.stopRecordTime = Date.now();
  c.isRecording = false;


}







function startRecord() {
  document.querySelector('#chat-input2').disabled = false;
  isRecording = true;
  setSnapshotDisplayElInnerHtml(displayElement.innerHTML);
  setSnapshotDisplayElOldInnerHtml(displayElementOld.innerHTML);

  if (pauseStartTime !== null) {
    // Berechne die Pausendauer, wenn pauseStartTime gesetzt ist
    const pauseEndTime = new Date().getTime();
    pauseDuration = pauseEndTime - pauseStartTime;
    console.log(`Pausendauer: ${pauseDuration} Millisekunden`);
  }

  // Setze pauseStartTime zurück
  pauseStartTime = null;
}

function stopRecord() {
  document.querySelector('#chat-input2').disabled = true;
  isRecording = false;

  // Setze den Startzeitpunkt der Pause
  pauseStartTime = new Date().getTime();
}

// Funktion zum Abrufen der Pausendauer
export function getPauseDuration() {
  return pauseDuration;
}



function changeCycle() {

  endCurrentCycle();
  startNewCycle();


}







function startNewCycle() {




}


function endCurrentCycle() {

}






function run() {


  const s = s();



}








function record(manipulation) {
  recordedManipulations.push(manipulation);
}



function play(){






}


function playRecord() {
  recordDisplayElementOld.innerHTML = '';
  recordDisplayElement.innerHTML = snapshot_displayElement;
  //recordDisplayElementOld.innerHTML = '';
  //recordDisplayElement.innerHTML = '';
  lastText = snapshot_lastText;
  //console.log('play');

  if (recordedManipulations.length === 0) return;

  let currentIndex = 0;
  const startTime = recordedManipulations[0].timestamp;

  function playNextAction() {
    if (currentIndex >= recordedManipulations.length) {
      return;
    }

    const action = recordedManipulations[currentIndex];
    const delay = action.timestamp - (currentIndex > 0 ? recordedManipulations[currentIndex - 1].timestamp : startTime);

    setTimeout(() => {
      fireManipulation(action.value, action.cursorStart, action.cursorEnd);
      currentIndex++;
      playNextAction();
    }, delay);
  }

  playNextAction();

}





export function checkChanges() {
  inputTextValue = inputElement.value;
  inputCursorStart = inputElement.selectionStart;
  inputCursorEnd = inputElement.selectionEnd;

  if (inputTextValue !== lastInputTextValue || inputCursorStart !== lastInputCursorStart || inputCursorEnd !== lastInputCursorEnd) {

    fire(inputTextValue, inputCursorStart, inputCursorEnd);

  }
}





export function fire(inputValue, cursorStart, cursorEnd) {
  const newManipulation = getManipulation(inputValue, cursorStart, cursorEnd, lastInputTextValue);

  if (isRecording) {
    record(newManipulation);
  }

  display(newManipulation);

}

function split(inputValue, cursorStart, cursorEnd, live_record_Element) {
  let separator = ' ';
  const maxInputValueLength = 50;
  let firstSpaceIndex = -1;

  if (inputValue.length > maxInputValueLength) {
    firstSpaceIndex = inputValue.indexOf(' ') === -1 ? 0 : inputValue.indexOf(' ');
    separator = '';
  }

  if (firstSpaceIndex !== -1) {
    updateDisplayOldSentences(inputValue.substring(0, firstSpaceIndex + 1) + separator, live_record_Element);
    inputElement.value = inputValue.substring(firstSpaceIndex + 1);

  } else {

    manipulateDisplay(inputValue, cursorStart, cursorEnd, live_record_Element);

  }



}

function updateDisplayOldSentences(inputValue, live_record_Element) {

  let targetElement;
  console.log(live_record_Element);
  if (live_record_Element === recordDisplayElement) {
    targetElement = recordDisplayElementOld;
  } else {
    targetElement = displayElementOld;
  }


  for (let i = 0; i < inputValue.length; i++) {
    const charSpan = document.createElement('span');
    charSpan.textContent = inputValue[i];
    targetElement.appendChild(charSpan);
  }
}






function manipulateDisplay(inputValue, cursorStart, cursorEnd, live_record_Element) {
  let targetElement;
  if (live_record_Element === recordDisplayElement) {
    targetElement = recordDisplayElement;
  } else {
    targetElement = displayElement;
  }


  const m = getManipulation(inputValue, cursorStart, cursorEnd, lastText);
  //console.log(m);


  const add_length = m.to_add.length;
  const delete_length = m.to_delete.length;

  const add_start_position = m.cursorStart - add_length;
  const delete_start_position = m.cursorStart + delete_length;



  if (m.to_add !== m.to_delete) {



    for (let i = add_start_position; i < add_start_position + add_length; i++) {

      //ermittele den i ten buchstaben aus m.to_add
      const charToAdd = m.to_add[i - add_start_position];
      // erzeuge ein span element mit dem buchstaben
      const charSpan = document.createElement('span');
      charSpan.textContent = charToAdd;

      //füge das span element in targetElement an position add_start_position plus i ein
      targetElement.insertBefore(
        charSpan,
        targetElement.childNodes[i]
      );
    }

    //console.log(delete_start_position + " " + targetElement.childNodes.length);
    for (let i = delete_start_position; i > delete_start_position - delete_length; i--) {


      targetElement.removeChild(targetElement.childNodes[i - 1]);



    }


  }

  // Kommentiere die for schleife aus
  /*
    for (let i = m.cursorStart; i < m.cursorEnd; i++) {
      const charSpan = document.createElement('span');
      charSpan.textContent = lastText[i];
      charSpan.classList.add('selected');
      targetElement.appendChild(charSpan);
      if (m.to_add !== m.to_delete) {


        //charSpan.classList.add('typewriter-char');
        //void charSpan.offsetWidth;
      }
    }

  */

}










function getManipulation(newText, newCursorStart, newCursorEnd, oldText) {



  const manipulation = {
    to_add: '',
    to_delete: '',
    cursorStart: newCursorStart,
    cursorEnd: newCursorEnd,
    timestamp: Date.now()
  };

  //kontrolliere ob die cursorStart und cursorEnd gleich sind
  if (newCursorStart === newCursorEnd) {


    // Finde den Startindex, ab dem sich die Texte unterscheiden
    let start = 0;
    while (
      start < oldText.length &&
      start < newText.length &&
      oldText[start] === newText[start]
    ) {
      start++;
    }

    // Finde den Endindex der Unterschiede
    let endOld = oldText.length;
    let endNew = newText.length;
    while (
      endOld > start &&
      endNew > start &&
      oldText[endOld - 1] === newText[endNew - 1]
    ) {
      endOld--;
      endNew--;
    }

    manipulation.to_delete = oldText.slice(start, endOld);
    manipulation.to_add = newText.slice(start, endNew);



  } else {

    // gebe mir den substring von newText von newCursorStart bis newCursorEnd
    manipulation.to_add = newText.substring(newCursorStart, newCursorEnd);
    manipulation.to_delete = oldText.substring(newCursorStart, newCursorEnd);

  }


  return manipulation;
}


function finish() {
  lastText = newText;
  lastCursorStart = newCursorStart;
  lastCursorEnd = newCursorEnd;

}
