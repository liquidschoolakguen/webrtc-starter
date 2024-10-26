
import { markChatMessageAsAcked } from '../../../screens/web_rtc/normal/normal_ui.js';

export function setupDataChannelChat(channel) {
  channel.onopen = () => {
     // console.log('dataChannelChat ist offen');
      document.querySelector('#chat-input').disabled = false;
      document.querySelector('#send-button').disabled = false;
  };

  channel.onmessage = (event) => {
      try {
          const messageObj = JSON.parse(event.data);
          if (messageObj.type === 'message') {
              const chatMessages = document.querySelector('#chat-messages');
              const messageEl = document.createElement('div');
              messageEl.textContent = 'Remote: ' + messageObj.data;
              chatMessages.appendChild(messageEl);
              chatMessages.scrollTop = chatMessages.scrollHeight;

              const ackObj = {
                  type: 'ack',
                  id: messageObj.id
              };
              channel.send(JSON.stringify(ackObj));
          } else if (messageObj.type === 'ack') {
              const ackedMessageId = messageObj.id;
              markChatMessageAsAcked(ackedMessageId);
          }
      } catch (error) {
          console.error('Fehler beim Verarbeiten der Chatnachricht:', error);
      }
  };

  channel.onclose = () => {
      document.querySelector('#chat-input').disabled = true;
      document.querySelector('#send-button').disabled = true;
  };

  channel.onerror = (error) => {
     // console.error('dataChannelChat Fehler:', error);
  };
}
