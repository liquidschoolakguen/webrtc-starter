

import { initLandingScreen, showLandingScreen } from './screens/landing/landing_ui.js';
import { initCallScreen } from './screens/call/call_ui.js';
import { initWaitingScreen } from './screens/waiting/waiting_ui.js';
import { initWebRTCScreen } from './screens/web_rtc/web_rtc_ui.js';
import { initNormalScreen } from './screens/web_rtc/normal/normal_ui.js';
import { initializeLucisScreen } from './screens/web_rtc/lucis/lucis_ui.js';

export let userName;
export let password;



 function initializeApp() {

  userName = "User-" + Math.floor(Math.random() * 100000);
  password = "x";




  initLandingScreen();
  initCallScreen();
  initWaitingScreen();
  initNormalScreen()
  initWebRTCScreen();
  initializeLucisScreen();


  showLandingScreen();
  console.log('App initialized');
}

initializeApp();
