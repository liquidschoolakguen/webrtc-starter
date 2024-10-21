// ui.js

import { initializeS } from './socket.js';
import { call, hangup, cancelCall, dataChannelChat, answerOffer} from './webrtc.js';
import { playRecord, record, checkChanges } from './ui_lucis.js';

export const userName = "User-" + Math.floor(Math.random() * 100000);
const password = "x";

export let isRecording = false;

export const inputElement = document.querySelector('#chat-input2');

export const displayElement = document.querySelector('#display');
export const displayElementOld = document.querySelector('#display-old');

export const recordDisplayElement = document.querySelector('#record-display');
export const recordDisplayElementOld = document.querySelector('#record-display-old');

export function initializeUI() {
  document.querySelector('#connect').addEventListener('click', () => {
    initializeS(userName, password);
  });

  document.querySelector('#call').addEventListener('click', () => {
    const videoEnabled = document.querySelector('#videoCheck').checked;
    const audioEnabled = document.querySelector('#audioCheck').checked;
    const chatEnabled = document.querySelector('#chatCheck').checked;
    call(videoEnabled, audioEnabled, chatEnabled);
  });

  document.querySelector('#hangup').addEventListener('click', hangup);
  document.querySelector('#early-hangup').addEventListener('click', cancelCall);

  document.querySelector('#send-button').addEventListener('click', sendMessage);

  document.querySelector('#record-btn').addEventListener('click', startRecord);
  document.querySelector('#stop-btn').addEventListener('click', stopRecord);
  document.querySelector('#play-btn').addEventListener('click', playRecord);

  inputElement.addEventListener('input', checkChanges);
  inputElement.addEventListener('click', checkChanges);
  inputElement.addEventListener('keyup', checkChanges);
  inputElement.addEventListener('select', checkChanges);

  document.querySelector('#chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  showLandingScreen();
}

function startRecord() {
  document.querySelector('#chat-input2').disabled = false;
  isRecording = true;
  recordDisplayElement.innerHTML = '';
}

function stopRecord() {
  document.querySelector('#chat-input2').disabled = true;
  isRecording = false;
}

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

    dataChannelChat.send(JSON.stringify(messageObj));

    const chatMessages = document.querySelector('#chat-messages');
    const messageEl = document.createElement('div');
    messageEl.id = messageId;
    messageEl.textContent = 'You: ' + messageText;
    messageEl.style.color = 'black';
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    sentMessages[messageId] = messageEl;

    input.value = '';
  }
}

const sentMessages = {};

export function markMessageAsAcked(messageId) {
  const messageEl = sentMessages[messageId];
  if (messageEl) {
    messageEl.style.color = 'red';
    delete sentMessages[messageId];
  }
}

export function createOfferEls(offers) {
  const answerEl = document.querySelector('#answer');
  answerEl.innerHTML = '';
  offers.forEach(o => {
    const newOfferEl = document.createElement('button');
    newOfferEl.className = 'btn btn-success';

    let optionsText = '';
    if (o.offerOptions) {
      optionsText += o.offerOptions.videoEnabled ? 'Video ' : '';
      optionsText += o.offerOptions.audioEnabled ? 'Audio ' : '';
      optionsText += o.offerOptions.chatEnabled ? 'Chat ' : '';
    }

    newOfferEl.textContent = `Annehmen von ${o.offererUserName} (${optionsText.trim()})`;
    newOfferEl.addEventListener('click', () => answerOffer(o));
    answerEl.appendChild(newOfferEl);

    hideCallWithOptions();
  });
}

export function showLandingScreen() {
  showConnectButton();
}

export function hideLandingScreen() {
  hideConnectButton();
}

export function showWaitingScreen() {
  showCallWithOptions();
}

export function hideWaitingScreen() {
  hideCallWithOptions();
  hideAnswerButtons();
  hideEarlyHangupButton();
}

export function showWebRTCScreen() {
  showHangupButton();
  hideCallWithOptions();
  hideAnswerButtons();
  showVideoAndChat();
}

export function hideWebRTCScreen() {
  hideHangupButton();
  hideVideoAndChat();
}

export function showConnectButton() {
  document.querySelector('#connect').style.display = 'inline-block';
}

export function hideConnectButton() {
  document.querySelector('#connect').style.display = 'none';
}

export function showCallWithOptions() {
  document.querySelector('#callWithOptions').style.display = 'inline-block';
}

export function hideCallWithOptions() {
  document.querySelector('#callWithOptions').style.display = 'none';
}

export function showHangupButton() {
  document.querySelector('#hangup').style.display = 'inline-block';
}

export function hideHangupButton() {
  document.querySelector('#hangup').style.display = 'none';
}

export function showEarlyHangupButton() {
  document.querySelector('#early-hangup').style.display = 'inline-block';
}

export function hideEarlyHangupButton() {
  document.querySelector('#early-hangup').style.display = 'none';
}

export function showVideoAndChat() {
  document.querySelector('#main_screen').style.display = 'block';
}

export function hideVideoAndChat() {
  document.querySelector('#main_screen').style.display = 'none';
}

export function hideAnswerButtons() {
  document.querySelector('#answer').innerHTML = '';
}

export function updateUIForOptions(options) {
  if (options.videoEnabled) {
    document.querySelector('#videos').style.display = 'block';
  } else {
    document.querySelector('#videos').style.display = 'none';
  }

  if (options.chatEnabled) {
    document.querySelector('#chat-input').disabled = false;
    document.querySelector('#send-button').disabled = false;
    document.querySelector('#chat').style.display = 'block';
  } else {
    document.querySelector('#chat-input').disabled = true;
    document.querySelector('#send-button').disabled = true;
    document.querySelector('#chat').style.display = 'none';
  }
}

function generateUniqueId() {
  return 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}
