//import { LucisSession } from './lucis_model.js';
import { _app } from '../../../app.js';



export let _s;

export function createSession() {
  _app.createNewLucisSession();
  _s = _app.lucisSession;

  console.log('lucis session created. Anzahl der Sessions: ' + _app.lucisSessions.length  );
}








export function startRecording() {
  console.log('startRecording');
  document.querySelector('#chat-input2').disabled = false;
  document.querySelector('#pause-screen').style.display = 'none';

  const textarea = document.getElementById('chat-inputX');
  textarea.focus();
  // starte das blinken des cursors
  const cursors = document.querySelectorAll('.cursor');
  cursors.forEach(cursor => {
    cursor.style.animation = 'blink 1s step-end infinite';
  });

  const display = document.querySelector('#display');
  const displayOld = document.querySelector('#display-old');


  document.querySelector('#reset-btn').disabled = true;
  document.querySelector('#play-btn').disabled = true;
  document.querySelector('#stop-btn').disabled = false;
  document.querySelector('#record-btn').disabled = true;




  _s.createNewCycle();
  _s.cycle.startRecordTime = Date.now();
  _s.cycle.isRecording = true;



  if (_s.cycles.length > 1) {
    //const lastCycle = _s.cycles[_s.cycles.length - 2];
    //console.log('SR inputValue: ' + lastCycle.data.inputValue);
    //console.log('SR lastInputValue: ' +lastCycle.data.lastInputValue);

   // _s.cycle.data.lastInputValue = lastCycle.data.inputValue;
    //console.log('SR inputValue: ' + _s.cycle.data.inputValue);
   // console.log('SR lastInputValue: ' + _s.cycle.data.lastInputValue);










  }

  display.innerHTML = _s.cycle.display;
  displayOld.innerHTML = _s.cycle.displayOld;


}

export function stopRecording() {
  console.log('stopRecording');
  document.querySelector('#chat-input2').disabled = true;
  const display = document.querySelector('#display');
  const displayOld = document.querySelector('#display-old');
  const inputValue = document.querySelector('#chat-input2').value;
  document.querySelector('#pause-screen').style.display = 'block';

  //unfocus
  const textarea = document.getElementById('chat-inputX');
  textarea.blur();

  // stoppe das blinken des cursors
  const cursors = document.querySelectorAll('.cursor');
  cursors.forEach(cursor => {
    cursor.style.animation = 'none';
  });


  document.querySelector('#reset-btn').disabled = false;
  document.querySelector('#play-btn').disabled = false;
  document.querySelector('#stop-btn').disabled = true;
  document.querySelector('#record-btn').disabled = false;


  _s.cycle.stopRecordTime = Date.now();
  _s.cycle.isRecording = false;



  //console.log(_s.cycle);


}




export function resetSession() {
  _app.resetLucisSession();
  document.querySelector('#display').innerHTML = '';
  document.querySelector('#display-old').innerHTML = '';
  document.querySelector('#chat-input2').value = '';
  console.log('resetSession');
}



export async function playCycles() {
  console.log('playCycles-----------');
  // wenn keine cycles vorhanden, dann console.log('no cycles');
  if (_s.cycles.length === 0) {
    console.log('no cycles');
    return;
  }

  // durchlaufe alle cycles
  for (let i = 0; i < _s.cycles.length; i++) {
    const cycle = _s.cycles[i];
    await playCycle(cycle);
  }

  console.log('playCycles-----------END');
}



function playCycle2(cycle) {


  const manipulations = cycle.data.manipulations;
  for (let i = 0; i < manipulations.length; i++) {
    const action = manipulations[i];
    console.log(action);
  }
  //console.log(cycle.input.value);



}








function playCycle(cycle) {
  return new Promise((resolve) => {
    if (cycle.data.manipulations.length !== 0) {
    let currentIndex = 0;
    const startTime = cycle.data.manipulations[0].timestamp;

    function playNextAction() {
      if (currentIndex >= cycle.data.manipulations.length) {
        resolve(); // Promise auflösen, wenn alle Aktionen abgespielt sind
        return;
      }

      const action = cycle.data.manipulations[currentIndex];
      const delay = action.timestamp - (currentIndex > 0 ? cycle.data.manipulations[currentIndex - 1].timestamp : startTime);

      setTimeout(() => {
        console.log(action);
        currentIndex++;
        playNextAction();
      }, delay);
    }

      playNextAction();
    }
  });
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



function play() {






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
