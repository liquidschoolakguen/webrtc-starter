





export function setupDataChannelLucis(channel) {
  channel.onopen = () => {
     // console.log('dataChannelChat ist offen');
      document.querySelector('#chat-input').disabled = false;
      document.querySelector('#send-button').disabled = false;
  };

  channel.onmessage = (event) => {
      try {
          const messageObj = JSON.parse(event.data);
          if (messageObj.type === 'manipulation') {

              console.log(messageObj);

              const ackObj = {
                  type: 'ack',
                  id: messageObj.id
              };
              channel.send(JSON.stringify(ackObj));
          } else if (messageObj.type === 'ack') {
              const ackedMessageId = messageObj.id;
              markMessageAsAcked(ackedMessageId);
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
