
import { _s } from './lucis_session.js';
import { _app } from '../../../app.js';





export function checkChanges() {

  //checkAndSetCursor(document.querySelector('#chat-input2').value, document.querySelector('#chat-input2').selectionStart, document.querySelector('#chat-input2').selectionEnd);


  const inputTextValue = document.querySelector('#chat-input2').value;
  const inputCursorStart = document.querySelector('#chat-input2').selectionStart;
  const inputCursorEnd = document.querySelector('#chat-input2').selectionEnd;


  const lastInputTextValue = _s.cycle.data.inputValue;
  const lastInputCursorStart = _s.cycle.data.inputCS;
  const lastInputCursorEnd = _s.cycle.data.inputCE;



  if (inputTextValue !== lastInputTextValue || inputCursorStart !== lastInputCursorStart || inputCursorEnd !== lastInputCursorEnd) {

    _s.cycle.data.setInputs(inputTextValue, inputCursorStart, inputCursorEnd);
    _s.cycle.data.createNewManipulation();

    const manipulation = _s.cycle.data.manipulation;
    //console.log(manipulation);

    _s.cycle.data.createConstruction();



    //displayManipulation(manipulation);

    _s.cycle.data.lastInputValue = inputTextValue;



    //test()

  }
}


function test(){

    if(_s.cycle.data.inputValue === _s.cycle.data.constructionValue &&
    _s.cycle.data.lastInputValue === _s.cycle.data.lastConstructionValue &&
    _s.cycle.data.inputCS === _s.cycle.data.manipulation.cursorStart &&
    _s.cycle.data.inputCE === _s.cycle.data.manipulation.cursorEnd
  ) {
    console.log("ok"  );
  }else{

    console.log("not ok");
    console.log(_s.cycle.data.inputValue, _s.cycle.data.constructionValue, );
    console.log( _s.cycle.data.lastInputValue, _s.cycle.data.lastConstructionValue);
  }


}

  // Diese Funktion dient dazu, dass der User nicht zu weit nach links scrollen kann
  //und die Cursorposition nicht zu weit nach links gesetzt wird
function checkAndSetCursor(inputValue, lastInputCursorStart, lastInputCursorEnd) {
  const minPosition = _app.settings.minPosition;

  const splitIndex = findSplitIndex(minPosition);
  const inputElement = document.querySelector('#chat-input2');



  if (lastInputCursorStart < splitIndex ) {
    inputElement.selectionStart = splitIndex;



  }
  if (lastInputCursorEnd <  splitIndex) {

    inputElement.selectionEnd = splitIndex;


  }

  inputElement.focus();

}



//diese Funktion sorgt dafür, dass die neu gesetzte Cursorpoition nicht mitten im Wort ist
function findSplitIndex(minPosition) {

  const maxInputValueLength = minPosition;
  let firstSpaceIndex = -1;

  const element = document.querySelector('#chat-input2');

  const inputValue = document.querySelector('#chat-input2').value

  if (inputValue.length > maxInputValueLength) {
    const ersterTeil = inputValue.substring(0, inputValue.length - maxInputValueLength);
    console.log(ersterTeil, ersterTeil.length);
    const cuttedInputValue = inputValue.substring(inputValue.length - maxInputValueLength, inputValue.length);
    console.log(cuttedInputValue, cuttedInputValue.length);
    firstSpaceIndex = cuttedInputValue.indexOf(' ') === -1 ? 0 : cuttedInputValue.indexOf(' ');
    console.log(firstSpaceIndex);
    //scrollZurCursorPosition(element, ersterTeil.length + firstSpaceIndex + 1)
    return ersterTeil.length + firstSpaceIndex + 1 ;

  }

  return minPosition;



}






















function checkChangesXX() {
  const inputElement = document.getElementById('input-element');
  const coloredText = document.getElementById('colored-text');
  const value = inputElement.value;

  let coloredValue = '';
  for (let i = 0; i < value.length; i++) {
    if (i < 30) {
      coloredValue += `<span style="color: green;">${value[i]}</span>`;
    } else {
      coloredValue += `<span style="color: red;">${value[i]}</span>`;
    }
  }

  coloredText.innerHTML = coloredValue;
}



let lastInputTextValue3 = '';
let lastInputCursorStart3 = 0;
let lastInputCursorEnd3 = 0;

export function checkChanges3() {
  console.log("checkChanges3");
  const inputTextValue = document.querySelector('#chat-input3').value;
  const inputCursorStart = document.querySelector('#chat-input3').selectionStart;
  const inputCursorEnd = document.querySelector('#chat-input3').selectionEnd;

  if (inputTextValue !== lastInputTextValue3 || inputCursorStart !== lastInputCursorStart3 || inputCursorEnd !== lastInputCursorEnd3) {

    console.log(inputTextValue, inputCursorStart, inputCursorEnd, "last: ", lastInputTextValue3);
    changeColor();

    lastInputTextValue3 = inputTextValue;
    lastInputCursorStart3 = inputCursorStart;
    lastInputCursorEnd3 = inputCursorEnd;
  }

}



export function focusInput() {
  console.log("focusInput");
  const inputElement = document.getElementById('chat-input3');
  inputElement.focus();
}







export function changeColor() {
  const inputElement = document.getElementById('chat-input3');
  const coloredText = document.getElementById('colored-text');
  const value = inputElement.value;
  const cursorPosition = inputElement.selectionStart;
  console.log("changeColor", value, cursorPosition);

  let coloredValue = '';
  for (let i = 0; i < value.length; i++) {
    if (i < 30) {
      coloredValue += `<span style="color: green;">${value[i]}</span>`;
    } else {
      coloredValue += `<span style="color: red;">${value[i]}</span>`;
    }
    if (i === cursorPosition - 1) {
      coloredValue += '<span class="cursor"></span>';
    }
  }

  if (cursorPosition === value.length) {
    coloredValue += '<span class="cursor"></span>';
  }

  coloredText.innerHTML = coloredValue;
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
