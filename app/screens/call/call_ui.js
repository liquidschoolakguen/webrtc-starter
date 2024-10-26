

import { call } from '../../lib/webrtc/create.js';




export function initCallScreen() {

  const callButton = document.querySelector('#call');



  callButton.addEventListener('click', async () => {

    const videoEnabled = document.querySelector('#videoCheck').checked;
    const audioEnabled = document.querySelector('#audioCheck').checked;
    const chatEnabled = document.querySelector('#chatCheck').checked;

    await call(videoEnabled, audioEnabled, chatEnabled);

  });




}

export function showCallScreen() {
  document.querySelector('#callWithOptions').style.display = 'inline-block';
}

export function hideCallScreen() {
  document.querySelector('#callWithOptions').style.display = 'none';
}
