import { cancelCall , answerOffer} from '../../lib/webrtc.js';






export function initWaitingScreen() {





  document.querySelector('#early-hangup').addEventListener('click', cancelCall);




  showWaitingScreen();
}










export function showWaitingScreen() {

}

export function hideWaitingScreen() {

  hideAnswerButton();
  hideEarlyHangupButton();
}







export function showEarlyHangupButton() {
  document.querySelector('#early-hangup').style.display = 'inline-block';
}

export function hideEarlyHangupButton() {
  document.querySelector('#early-hangup').style.display = 'none';
}



export function hideVideoAndChat() {
  document.querySelector('#main_screen').style.display = 'none';
}

export function hideAnswerButton() {
  document.querySelector('#answer').innerHTML = '';
}




export function showAnswerButton(offers) {
  // Antwortbereich leeren
  const answerEl = document.querySelector('#answer');
  answerEl.innerHTML = '';
  offers.forEach(o => {
    const newOfferEl = document.createElement('button');
    newOfferEl.className = 'btn btn-success';

    // Optionen extrahieren
    let optionsText = '';
    if (o.offerOptions) {
      optionsText += o.offerOptions.videoEnabled ? 'Video ' : '';
      optionsText += o.offerOptions.audioEnabled ? 'Audio ' : '';
      optionsText += o.offerOptions.chatEnabled ? 'Chat ' : '';
    }

    newOfferEl.textContent = `Annehmen von ${o.offererUserName} (${optionsText.trim()})`;
    newOfferEl.addEventListener('click', () => answerOffer(o));
    answerEl.appendChild(newOfferEl);

    // UI aktualisieren

  });
}