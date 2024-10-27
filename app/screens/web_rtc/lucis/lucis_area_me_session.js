import { _s } from './lucis_session.js';
import { _app } from '../../../app.js';

import { dataChannelLucis } from '../../../lib/webrtc/create.js';


let firstRun = true;



function escapeHTML(char) {
  const charCode = char.charCodeAt(0);
  if (char === '&') return '&amp;';
  if (char === '<') return '&lt;';
  if (char === '>') return '&gt;';
  if (char === '"') return '&quot;';
  if (char === "'") return '&#039;';
  if (char === '\n') return '<br>';
  return char;
}


export function checkAreaMeChanges() {
  if (firstRun) {
    initCursor();
    firstRun = false;
  }


  const textarea = document.getElementById('chat-inputX');
  //checkAndSetCursor(document.querySelector('#chat-input2').value, document.querySelector('#chat-input2').selectionStart, document.querySelector('#chat-input2').selectionEnd);


  const inputTextValue = textarea.value;
  const inputCursorStart = textarea.selectionStart;
  const inputCursorEnd = textarea.selectionEnd;


  const lastInputTextValue = _s.cycle.data.inputValue;
  const lastInputCursorStart = _s.cycle.data.inputCS;
  const lastInputCursorEnd = _s.cycle.data.inputCE;



  if (inputTextValue !== lastInputTextValue || inputCursorStart !== lastInputCursorStart || inputCursorEnd !== lastInputCursorEnd) {

    _s.cycle.data.setInputs(inputTextValue, inputCursorStart, inputCursorEnd);
    _s.cycle.data.createNewManipulation();

    const manipulation = _s.cycle.data.manipulation;
    //console.log(manipulation);

    _s.cycle.data.createConstruction();

    updateMirror();
    //displayManipulation(manipulation);

    _s.cycle.data.lastInputValue = inputTextValue;
    // console.log('CC inputTextValue: ' + inputTextValue);
    // console.log('CC lastInputValue: ' + _s.cycle.data.lastInputValue);


  }
}


function initCursor() {
  const chars = [];
  chars.push('<span class="cursor"></span>');
  let content = chars.join('');

  const mirror = document.getElementById('mirror');
  mirror.innerHTML = content;

}

const charTimestamps = {};



function updateMirror() {
console.log('fire');
  const mirror = document.getElementById('mirror');
  const textarea = document.getElementById('chat-inputX');
  const value = _s.cycle.data.inputValue;
  const lastValue = _s.cycle.data.lastInputValue;
  const to_add = _s.cycle.data.manipulation.to_add;
  const to_delete = _s.cycle.data.manipulation.to_delete; // Added to handle deletions
  const selectionStart = _s.cycle.data.manipulation.cursorStart;
  const selectionEnd = _s.cycle.data.manipulation.cursorEnd;

  // Berechne den Index, an dem die neuen Zeichen beginnen
  const addStartIndex = selectionStart - to_add.length; // Position in lastValue

  // Bestehende Zeichenknoten
  const existingSpans = Array.from(mirror.querySelectorAll('.char'));

  // Index für die Schleife
  let i = 0;

  if (selectionStart !== selectionEnd) {
    // Eine Auswahl findet statt.
    // value === lastValue
    // Es muss weder etwas gelöscht noch etwas hinzugefügt werden

    // Entferne bestehende 'selection'-Klassen
    existingSpans.forEach(span => span.classList.remove('selection'));

    // Füge die 'selection'-Klasse zu den entsprechenden Spans hinzu
    for (let i = selectionStart; i < selectionEnd; i++) {
      const span = existingSpans[i];
      if (span) {
        span.classList.add('selection');
      }
    }

    // Cursor wird bei einer Auswahl nicht angezeigt
    // Entferne vorhandene Cursor-Spans
    const existingCursors = mirror.querySelectorAll('.cursor');
    const existingCursors2 = textarea.querySelectorAll('.cursor');
    existingCursors.forEach(cursorSpan => cursorSpan.remove());

  } else {
    if (to_delete && to_delete.length > 0) {
      // Etwas wird gelöscht
      // Entferne die entsprechenden Spans aus dem Mirror
      const deleteStartIndex = selectionStart; // Position in lastValue

      for (let j = 0; j < to_delete.length; j++) {
        const spanToDelete = mirror.childNodes[deleteStartIndex];
        if (spanToDelete && spanToDelete.classList.contains('char')) {
          mirror.removeChild(spanToDelete);
        }
      }
    }

    if (to_add && to_add.length > 0) {
      // Etwas wird hinzugefügt. An Position addStartIndex von lastValue
      // Erstelle Spans für die neuen Zeichen mit der Schrumpfanimation
      const newChars = to_add.split('').map(char => {
        const escapedChar = escapeHTML(char);
        const span = document.createElement('span');
        span.classList.add('char', 'shrinking_left');
        span.setAttribute('data-char', char);
        span.innerHTML = escapedChar;
        return span;
      });

      // Füge die neuen Spans in den Mirror ein
      for (let j = 0; j < newChars.length; j++) {
        const span = newChars[j];
        mirror.insertBefore(span, mirror.childNodes[addStartIndex + j]);
      }
    }

    // Aktualisiere bestehende Spans, um den aktuellen Wert widerzuspiegeln
    const spans = Array.from(mirror.querySelectorAll('.char'));
    for (let k = 0; k < spans.length; k++) {
      const span = spans[k];
      const char = value[k];
      if (span.getAttribute('data-char') !== char) {
        // Aktualisiere das Span
        const escapedChar = escapeHTML(char);
        span.setAttribute('data-char', char);
        span.innerHTML = escapedChar;
      }
    }

    // Entferne vorhandene 'selection'-Klassen
    spans.forEach(span => span.classList.remove('selection'));

    // Cursor positionieren
    // Entferne vorhandene Cursor-Spans
    const existingCursors = mirror.querySelectorAll('.cursor');
    existingCursors.forEach(cursorSpan => cursorSpan.remove());

    // Erstelle ein neues Cursor-Span
    const cursorSpan = document.createElement('span');
    cursorSpan.classList.add('cursor');

    // Füge den Cursor an der richtigen Position ein
    mirror.insertBefore(cursorSpan, mirror.childNodes[selectionStart]);
  }
  console.log('Spans im mirror nach updateMirror:', mirror.querySelectorAll('.char').length);
  // Synchronisiere den Scroll
  syncScroll();
}




export function syncScroll() {
  const mirror = document.getElementById('mirror');
  const textarea = document.getElementById('chat-inputX');
  mirror.scrollTop = textarea.scrollTop;
  mirror.scrollLeft = textarea.scrollLeft;
}
















export function getCharIndexAtPosition(event) {
  // console.log('getCharIndexAtPosition');
 const mirror = document.getElementById('mirror');
 const mirrorRect = mirror.getBoundingClientRect();
 const clickX = event.clientX - mirrorRect.left;
 const clickY = event.clientY - mirrorRect.top;

 const spans = Array.from(mirror.querySelectorAll('.char'));
 //console.log('Anzahl der Spans:', spans.length);

 let index = 0;
 let found = false;

 for (let i = 0; i < spans.length; i++) {
   const span = spans[i];
   const spanRect = span.getBoundingClientRect();
   const spanX = spanRect.left - mirrorRect.left;
   const spanY = spanRect.top - mirrorRect.top;

   if (
     clickY >= spanY &&
     clickY <= spanY + spanRect.height &&
     clickX >= spanX &&
     clickX <= spanX + spanRect.width
   ) {
     index = i;

     // Entscheide, ob der Cursor nach dem Zeichen stehen soll
     const charMiddleX = spanX + spanRect.width / 2;
     if (clickX > charMiddleX) {
       index += 1;
     }

     found = true;
     break;
   }
 }

 if (!found) {
   index = spans.length;
 }
 //console.log('index', index);
 return index;
}

export function setNewCursorPositionInInputArea(mirrorCursorPositionStart, mirrorCursorPositionEnd) {
 const textarea = document.getElementById('chat-inputX');

 // Aktualisiere die Cursorposition im Textarea
 textarea.focus();
 textarea.setSelectionRange(mirrorCursorPositionStart, mirrorCursorPositionEnd);
 console.log('textarea.selectionStart', textarea.selectionStart, 'textarea.selectionEnd', textarea.selectionEnd);

 //gebe mir den buchstaben an der position textarea.selectionStart
 const char = textarea.value[mirrorCursorPositionStart];
 console.log('char', char);
 checkAreaMeChanges();


}
