

import { initSocket } from '../../lib/socket.js';
import { initCallScreen } from '../call/call_ui.js';




export function initLandingScreen() {


  document.querySelector('#connect').addEventListener('click', async () => {
    try {
     await initSocket();




    } catch (err) {
      console.error(err);
    }
  });




  //showLandingScreen();



}

export function showLandingScreen() {
    showConnectButton();
}



export function hideLandingScreen() {
  hideConnectButton();
}


 function showConnectButton() {
  document.querySelector('#connect').style.display = 'inline-block';
}

 function hideConnectButton() {
  document.querySelector('#connect').style.display = 'none';
}
