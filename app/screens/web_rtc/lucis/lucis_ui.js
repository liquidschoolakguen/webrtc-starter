// ui_lucis.js

import { hideAnswerButton } from  '../../waiting/waiting_ui.js';
import { hangup } from '../../../lib/webrtc.js';


export function initWebRTCScreen() {

  document.querySelector('#hangup').addEventListener('click', hangup);


}


export function showHangupButton() {
  document.querySelector('#hangup').style.display = 'inline-block';


}

export function hideHangupButton() {
  document.querySelector('#hangup').style.display = 'none';
}



export function showVideoAndChat() {
  document.querySelector('#main_screen').style.display = 'block';
}


export function hideVideoAndChat() {
  document.querySelector('#main_screen').style.display = 'none';
}


export function showWebRTCScreen() {
  showHangupButton();

  hideAnswerButton();
  showVideoAndChat();

}

export function hideWebRTCScreen() {
  hideHangupButton();
  hideVideoAndChat();

}








export function updateUIForOptions(options) {
  console.log(options);
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
