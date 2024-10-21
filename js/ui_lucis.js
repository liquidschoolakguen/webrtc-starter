// ui_lucis.js

import { inputElement, displayElement, displayElementOld, recordDisplayElement, recordDisplayElementOld, isRecording } from './ui.js';

export let recordedActions = [];
let lastInputValue = '';
let lastText = '';
let lastCursorStart = 0;
let lastCursorEnd = 0;

export function playRecord() {
  recordDisplayElementOld.innerHTML = '';
  if (recordedActions.length === 0) return;

  let currentIndex = 0;
  const startTime = recordedActions[0].timestamp;

  function playNextAction() {
    if (currentIndex >= recordedActions.length) {
      return;
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

export function fire(inputValue, cursorStart, cursorEnd, targetElement = displayElement) {
  inputValue = inputValue ? cutSentence(inputValue, recordDisplayElementOld) : cutSentence(inputElement.value, displayElementOld);
  cursorStart = cursorStart !== undefined ? cursorStart : inputElement.selectionStart;
  cursorEnd = cursorEnd !== undefined ? cursorEnd : inputElement.selectionEnd;

  updateDisplay(inputValue, cursorStart, cursorEnd, targetElement);
}

function cutSentence(inputValue, targetElement) {
  let separator = ' ';
  const maxInputValueLength = 50;
  let firstSpaceIndex = -1;

  if (inputValue.length > maxInputValueLength) {
    firstSpaceIndex = inputValue.indexOf(' ') === -1 ? 0 : inputValue.indexOf(' ');
    separator = '';
  }

  if (firstSpaceIndex !== -1) {
    updateDisplayOldSentences(inputValue.substring(0, firstSpaceIndex + 1) + separator, targetElement);
    inputElement.value = inputValue.substring(firstSpaceIndex + 1);
    return inputValue.substring(firstSpaceIndex + 1);
  }

  return inputValue;
}

function updateDisplayOldSentences(inputValue, targetElement = displayElementOld) {
  for (let i = 0; i < inputValue.length; i++) {
    const charSpan = document.createElement('span');
    charSpan.textContent = inputValue[i];
    targetElement.appendChild(charSpan);
  }
}

export function record(inputValue, cursorStart, cursorEnd) {
  recordedActions.push({
    value: inputValue,
    cursorStart: cursorStart,
    cursorEnd: cursorEnd,
    timestamp: Date.now()
  });
}

export function checkChanges(event) {
  const currentValue = inputElement.value;
  const currentSelectionStart = inputElement.selectionStart;
  const currentSelectionEnd = inputElement.selectionEnd;

  if (currentValue !== lastInputValue ||
      currentSelectionStart !== lastCursorStart ||
      currentSelectionEnd !== lastCursorEnd) {

    fire();
    if (isRecording) {
      record(currentValue, currentSelectionStart, currentSelectionEnd);
    }

    lastInputValue = currentValue;
    lastCursorStart = currentSelectionStart;
    lastCursorEnd = currentSelectionEnd;
  }
}

function updateDisplay(inputValue, cursorStart, cursorEnd, targetElement) {
  const manipulation = getManipulation(inputValue, cursorStart, cursorEnd);
  targetElement.innerHTML = '';

  let newCharIndices = [];
  if (inputValue.length > lastText.length) {
    let firstDiff = -1;
    for (let i = 0; i < inputValue.length; i++) {
      if (i >= lastText.length || inputValue[i] !== lastText[i]) {
        firstDiff = i;
        break;
      }
    }
    if (firstDiff !== -1) {
      let numAdded = inputValue.length - lastText.length;
      for (let i = firstDiff; i < firstDiff + numAdded && i < inputValue.length; i++) {
        newCharIndices.push(i);
      }
    }
  }

  for (let i = 0; i < inputValue.length; i++) {
    const charSpan = document.createElement('span');
    charSpan.textContent = inputValue[i];

    if (i >= cursorStart && i < cursorEnd) {
      charSpan.classList.add('selected');
    }

    if (newCharIndices.includes(i)) {
      charSpan.classList.add('typewriter-char');
      void charSpan.offsetWidth;
    }

    targetElement.appendChild(charSpan);
  }

  const cursorElement = document.createElement('span');
  cursorElement.classList.add('cursor');
  if (cursorStart === cursorEnd) {
    const cursorPosition = inputValue.length - cursorStart;

    if (cursorPosition === 0) {
      targetElement.appendChild(cursorElement);
    } else {
      targetElement.insertBefore(
        cursorElement,
        targetElement.childNodes[targetElement.childNodes.length - cursorPosition]
      );
    }
  }

  lastText = inputValue;
}

function getManipulation(newText, cursorStart, cursorEnd) {
  const manipulation = {
    type: '',
    to_add: '',
    to_delete: '',
    cursorStart: cursorStart,
    cursorEnd: cursorEnd,
  };

  if (cursorStart !== cursorEnd) {
    manipulation.type = 'select';
  } else if (lastCursorStart !== lastCursorEnd) {
    const deletedText = lastText.slice(lastCursorStart, lastCursorEnd);
    const addedTextLength = newText.length - (lastText.length - (lastCursorEnd - lastCursorStart));
    const addedText = newText.slice(lastCursorStart, lastCursorStart + addedTextLength);

    manipulation.type = 'replace';
    manipulation.to_delete = deletedText;
    manipulation.to_add = addedText;
    manipulation.cursorStart = lastCursorStart;
    manipulation.cursorEnd = lastCursorEnd;
  } else {
    let start = 0;
    while (start < lastText.length && start < newText.length && lastText[start] === newText[start]) {
      start++;
    }

    let endLast = lastText.length;
    let endNew = newText.length;
    while (endLast > start && endNew > start && lastText[endLast - 1] === newText[endNew - 1]) {
      endLast--;
      endNew--;
    }

    const to_delete = lastText.slice(start, endLast);
    const to_add = newText.slice(start, endNew);

    if (to_add.length > 0 && to_delete.length === 0) {
      manipulation.type = 'add';
      manipulation.to_add = to_add;
      manipulation.cursorStart = start;
      manipulation.cursorEnd = start + to_add.length;
    } else if (to_add.length === 0 && to_delete.length > 0) {
      manipulation.type = 'delete';
      manipulation.to_delete = to_delete;
      manipulation.cursorStart = start;
      manipulation.cursorEnd = start;
    } else if (to_add.length > 0 && to_delete.length > 0) {
      manipulation.type = 'replace';
      manipulation.to_add = to_add;
      manipulation.to_delete = to_delete;
      manipulation.cursorStart = start;
      manipulation.cursorEnd = endLast;
    } else {
      manipulation.type = 'none';
    }
  }

  lastText = newText;
  lastCursorStart = cursorStart;
  lastCursorEnd = cursorEnd;

  return manipulation;
}
