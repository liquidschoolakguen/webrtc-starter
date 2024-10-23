
import { Cycle } from './lucis_model.js';


let _session;

export function setSession(newSession) {
  _session = newSession;
}

export function getSession() {
  return _session;
}

export function service() {



  console.log(_session);


  // Weitere Logik hier...
}






export function startRecording() {
  console.log('startRecording');
  document.querySelector('#chat-input2').disabled = false;
  const displayElement = document.querySelector('#display');
  const displayElementOld = document.querySelector('#display-old');



  _session.current_cycle.startRecordTime = Date.now();
  _session.current_cycle.isRecording = true;


  _session.current_cycle.initial_state.ui.displayElInnerHtml = displayElement.innerHTML;
  _session.current_cycle.initial_state.ui.displayElOldInnerHtml = displayElementOld.innerHTML;
  console.log(_session);

}

export function stopRecording() {
  document.querySelector('#chat-input2').disabled = true;
  const displayElement = document.querySelector('#display');
  const displayElementOld = document.querySelector('#display-old');



  _session.current_cycle.stopRecordTime = Date.now();
  _session.current_cycle.isRecording = false;


  _session.current_cycle.final_state.ui.displayElInnerHtml = displayElement.innerHTML;
  _session.current_cycle.final_state.ui.displayElOldInnerHtml = displayElementOld.innerHTML;
  console.log(_session);


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
