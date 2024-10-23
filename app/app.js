

import { initLandingScreen, showLandingScreen } from './screens/landing/landing_ui.js';
import { initCallScreen } from './screens/call/call_ui.js';
import { initWaitingScreen } from './screens/waiting/waiting_ui.js';
import { initWebRTCScreen } from './screens/web_rtc/web_rtc_ui.js';
import { initNormalScreen } from './screens/web_rtc/normal/normal_ui.js';
import { initializeLucisScreen } from './screens/web_rtc/lucis/lucis_ui.js';


//for debug
import { initSocket } from './lib/socket.js';
import { call } from './lib/webrtc.js';

export let userName;
export let password;

export const debug = true;

 function initializeApp() {

  userName = "User-" + Math.floor(Math.random() * 100000);
  password = "x";




  initLandingScreen();
  initCallScreen();
  initWaitingScreen();
  initNormalScreen()
  initWebRTCScreen();
  initializeLucisScreen();

  console.log('App initialized');

  if (debug) {
    initSocket();
    call(false, false, true);
  }else{
    showLandingScreen();
  }



}

initializeApp();
