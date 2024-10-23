

import { initLandingScreen, showLandingScreen } from './screens/landing/landing_ui.js';
import { initCallScreen } from './screens/call/call_ui.js';
import { initWaitingScreen } from './screens/waiting/waiting_ui.js';
import { initWebRTCScreen } from './screens/web_rtc/lucis/lucis_ui.js';


export let userName;
export let password;



 function initializeApp() {

  userName = "User-" + Math.floor(Math.random() * 100000);
  password = "x";




  initLandingScreen();
  initCallScreen();
  initWaitingScreen();
  initWebRTCScreen();


  showLandingScreen();
  console.log('App initialized');
}

initializeApp();
