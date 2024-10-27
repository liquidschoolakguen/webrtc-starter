

import { createSession, startRecording } from '../../../screens/web_rtc/lucis/lucis_session.js'

import { runApp, debug } from '../../../app.js';
import { _app } from '../../../app.js';
import { dataChannelSystem, didIOffer, closeWebRTC } from '../create.js';
import { checkAreaMeChanges } from '../../../screens/web_rtc/lucis/lucis_area_me_session.js';





export async function setupDataChannelSystem(channel) {
  channel.onopen = () => {

    if(didIOffer) {
      console.log('didIOffer is true');

    }else{
      console.log('didIOffer is false');
    }


    createSession();
    startRecording();
    checkAreaMeChanges();


     // console.log('dataChannelSystem ist offen');
  };

  channel.onmessage = async (event) => {





          try {
              const messageObj = JSON.parse(event.data);
              if (messageObj.type === 'hangup') {


                  const ackObj = {
                      type: 'ack',
                      id: messageObj.id
                  };
                  channel.send(JSON.stringify(ackObj));


                  await closeWebRTC();

              } else if (messageObj.type === 'ack') {
                  const ackedMessageId = messageObj.id;
                  markMessageAsAcked(ackedMessageId);
              }
          } catch (error) {
              console.error('Fehler beim Verarbeiten der Chatnachricht:', error);
          }

















     // if (event.data === '__hangup__') {
      //    closeWebRTC();
      //}
  };

  channel.onclose = async () => {
      await closeWebRTC();
      console.log('dataChannelSystem ist geschlossen');
      runApp(debug);

  };

  channel.onerror = (error) => {
      //console.error('dataChannelSystem Fehler:', error);
  };
}








export async function hangup() {
  if (dataChannelSystem && dataChannelSystem.readyState === 'open') {



      const id = _app.meUser.userName + '_' + Date.now();
      const messageObj = {
        id: id,
        timestamp: Date.now(),
        type: 'hangup'
      };


      dataChannelSystem.send(JSON.stringify(messageObj));
  }
  await closeWebRTC();
}

export async function start() {
  if (dataChannelSystem && dataChannelSystem.readyState === 'open') {
      const messageId = 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
      const id = _app.meUser.userName + '_' + Date.now();
      const messageObj = {
        id: id,
        timestamp: Date.now(),
        type: 'start'
      };
      dataChannelSystem.send(JSON.stringify(messageObj));
  }

}

export async function stop() {
  if (dataChannelSystem && dataChannelSystem.readyState === 'open') {
      const id = _app.meUser.userName + '_' + Date.now();
      const messageObj = {
        id: id,
        timestamp: Date.now(),
        type: 'stop'
      };
      dataChannelSystem.send(JSON.stringify(messageObj));
  }
}
