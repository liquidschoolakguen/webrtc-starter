// ui.js

import { initSocket } from './lib/socket.js';
import { hangup, cancelCall, dataChannelChat, answerOffer} from   './lib/webrtc.js'



export const userName = "User-" + Math.floor(Math.random() * 100000);
const password = "x";



export const inputElement = document.querySelector('#chat-input2');

export const displayElement = document.querySelector('#display');
export const displayElementOld = document.querySelector('#display-old');

export const recordDisplayElement = document.querySelector('#record-display');
export const recordDisplayElementOld = document.querySelector('#record-display-old');

export function initializeUI() {




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
