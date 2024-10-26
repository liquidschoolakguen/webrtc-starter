import { dataChannelChat } from '../../../lib/webrtc/create.js';



export function initNormalScreen() {
  document.querySelector('#send-button').addEventListener('click', sendMessage);

  document.querySelector('#chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });



}


function sendMessage() {
  const input = document.querySelector('#chat-input');
  const messageText = input.value.trim();
  if (messageText && dataChannelChat && dataChannelChat.readyState === 'open') {
    const messageId = 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
    const messageObj = {
      type: 'message',
      id: messageId,
      data: messageText
    };

    dataChannelChat.send(JSON.stringify(messageObj));

    const chatMessages = document.querySelector('#chat-messages');
    //scrollbar von chatMessages ausblenden
    //chatMessages.style.overflowY = 'hidden';
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

export function markChatMessageAsAcked(messageId) {
  const messageEl = sentMessages[messageId];
  if (messageEl) {
    messageEl.style.color = 'red';
    delete sentMessages[messageId];
  }
}
