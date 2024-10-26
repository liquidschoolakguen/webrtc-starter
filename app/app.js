

import { initLandingScreen, showLandingScreen } from './screens/landing/landing_ui.js';
import { initCallScreen } from './screens/call/call_ui.js';
import { initWaitingScreen } from './screens/waiting/waiting_ui.js';
import { initWebRTCScreen, hideWebRTCScreen } from './screens/web_rtc/web_rtc_ui.js';
import { initNormalScreen } from './screens/web_rtc/normal/normal_ui.js';
import { initializeLucisScreen } from './screens/web_rtc/lucis/lucis_ui.js';
import { App } from './screens/web_rtc/lucis/lucis_model.js';
import { createMirrorSync } from './screens/web_rtc/lucis/lucis_mirror_ui.js';



//for debug
import { initSocket } from './lib/socket.js';
import { call } from './lib/webrtc/create.js';


export let _app;

export function createApp(userName) {
  _app = new App(userName);
  console.log('app created');
}


export const debug = true;
export const minPosition = 30;

function initializeApp() {

  const userName = "User-" + Math.floor(Math.random() * 100000);

  createApp(userName);


  initLandingScreen();
  initCallScreen();
  initWaitingScreen();
  initNormalScreen()
  initWebRTCScreen();
  initializeLucisScreen();

  // Synchronisation für die erste Eingabegruppe (links)
  createMirrorSync('chat-inputX', 'mirror');


  // Synchronisation für die zweite Eingabegruppe (rechts)
  createMirrorSync('chat-inputX_rechts', 'mirror_rechts');


  console.log('App initialized');


  runApp(debug);

}


export function runApp(debug) {
  //console.log('runApp');
  if (debug) {
    console.log('runApp: --- debugMode ---')
    initSocket();
    call(false, false, true);

  } else {
    console.log('runApp: --- normalMode ---');
    hideWebRTCScreen();
    showLandingScreen();

  }


}

initializeApp();
