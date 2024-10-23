

import { startRecording, stopRecording } from './lucis_session.js';
import { checkChanges } from './lucis_cycle.js';

export const inputElement = document.querySelector('#chat-input2');

export const displayElement = document.querySelector('#display');
export const displayElementOld = document.querySelector('#display-old');

export const recordDisplayElement = document.querySelector('#record-display');
export const recordDisplayElementOld = document.querySelector('#record-display-old');

export function initializeLucisScreen() {






  document.querySelector('#record-btn').addEventListener('click', startRecording);
  document.querySelector('#stop-btn').addEventListener('click', stopRecording);
  //document.querySelector('#play-btn').addEventListener('click', playRecord);

  inputElement.addEventListener('input', checkChanges);
  inputElement.addEventListener('click', checkChanges);
  inputElement.addEventListener('keyup', checkChanges);
  inputElement.addEventListener('select', checkChanges);




}


function showLucisScreen() {

}
