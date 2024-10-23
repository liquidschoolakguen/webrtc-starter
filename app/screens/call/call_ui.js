

import { call } from '../../lib/webrtc.js';



export function initCallScreen() {

  const callButton = document.querySelector('#call');



  callButton.addEventListener('click', () => {

    const videoEnabled = document.querySelector('#videoCheck').checked;
    const audioEnabled = document.querySelector('#audioCheck').checked;
    const chatEnabled = document.querySelector('#chatCheck').checked;

   call(videoEnabled, audioEnabled, chatEnabled);

  });


  //showCallScreen();

}

export function showCallScreen() {
  document.querySelector('#callWithOptions').style.display = 'inline-block';
}

export function hideCallScreen() {
  document.querySelector('#callWithOptions').style.display = 'none';
}
