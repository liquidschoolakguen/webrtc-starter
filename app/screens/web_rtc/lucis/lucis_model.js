


class Input {
  #textValue;
  #cursorStart;
  #cursorEnd;


  constructor() {
    this.#textValue = '';
    this.#cursorStart = 0;
    this.#cursorEnd = 0;

  }

  setTextValue(textValue) {
    this.#textValue = textValue;

  }
  setCursorStart(cursorStart) {
    this.#cursorStart = cursorStart;
  }
  setCursorEnd(cursorEnd) {
    this.#cursorEnd = cursorEnd;
  }


  get() {
    return {
      textValue: this.#textValue,
      cursorStart: this.#cursorStart,
      cursorEnd: this.#cursorEnd,

    };
  }
}



class UI {
  #displayElInnerHtml;
  #displayElOldInnerHtml;
  #input;
  #lastInput;

  constructor() {
    this.#displayElInnerHtml = '';
    this.#displayElOldInnerHtml = '';
    this.#input = new Input();
    this.#lastInput = new Input();
  }

  setDisplayElInnerHtml(value) {
    this.#displayElInnerHtml = value;
  }

  getDisplayElInnerHtml() {
    return this.#displayElInnerHtml;
  }

  setDisplayElOldInnerHtml(value) {
    this.#displayElOldInnerHtml = value;
  }

  getDisplayElOldInnerHtml() {
    return this.#displayElOldInnerHtml;
  }



  getInput() {
    return this.#input.get();
  }



  getLastInput() {
    return this.#lastInput.get();
  }
}




class Data {
  #written;
  #lastWritten;

  constructor() {
    this.#written = '';
    this.#lastWritten = '';
  }

  setWritten(value) {
    this.#written = value;
  }

  getWritten() {
    return this.#written;
  }

  setLastWritten(value) {
    this.#lastWritten = value;
  }

  getLastWritten() {
    return this.#lastWritten;
  }
}




class State {
  #ui;
  #data;

  constructor() {
    this.#ui = new UI();
    this.#data = new Data();
  }

  getUi() {
    return this.#ui;
  }

  getData() {
    return this.#data;
  }
}




class Cycle {
  #creationTime;
  #endingTime;
  #startRecordTime;
  #stopRecordTime;
  #initial_state;
  #current_state;
  #final_state;
  #isRecording;

  constructor() {
    this.#creationTime = 0;
    this.#endingTime = 0;
    this.#startRecordTime = 0;
    this.#stopRecordTime = 0;
    this.#initial_state = new State();
    this.#current_state = new State();
    this.#final_state = new State();
    this.#isRecording = false;
  }

  setCreationTime(time) {
    this.#creationTime = time;
  }

  getCreationTime() {
    return this.#creationTime;
  }

  setEndingTime(time) {
    this.#endingTime = time;
  }

  getEndingTime() {
    return this.#endingTime;
  }

  setStartRecordTime(time) {
    this.#startRecordTime = time;
  }

  getStartRecordTime() {
    return this.#startRecordTime;
  }

  setStopRecordTime(time) {
    this.#stopRecordTime = time;
  }

  getStopRecordTime() {
    return this.#stopRecordTime;
  }






  getInitialState() {
    return this.#initial_state;
  }



  getCurrentState() {
    return this.#current_state;
  }


  getFinalState() {
    return this.#final_state;
  }




  setIsRecording(isRecording) {
    this.#isRecording = isRecording;
  }

  getIsRecording() {
    return this.#isRecording;
  }



  // Zusätzliche Methode, um alle Daten auf einmal zu erhalten
  get() {
    return {
      creationTime: this.#creationTime,
      endingTime: this.#endingTime,
      startRecordTime: this.#startRecordTime,
      stopRecordTime: this.#stopRecordTime,
      initial_state: this.#initial_state,
      current_state: this.#current_state,
      final_state: this.#final_state,
      isRecording: this.#isRecording
    };
  }
}





export class Session {
  #sessionStartTime;
  #cycles;
  #current_cycle;

  constructor() {
    this.#sessionStartTime = 0;
    this.#cycles = [];
    this.#current_cycle = null; // Oder new Cycle(), falls Sie eine Cycle-Klasse haben
  }

  setSessionStartTime(time) {
    this.#sessionStartTime = time;
  }

  getSessionStartTime() {
    return this.#sessionStartTime;
  }

  addCycle(cycle) {
    this.#cycles.push(cycle);
  }

  getCycles() {
    return [...this.#cycles]; // Gibt eine Kopie des Arrays zurück
  }

  setCurrentCycle(cycle) {
    this.#current_cycle = cycle;
  }

  getCurrentCycle() {
    return this.#current_cycle;
  }

  // Zusätzliche Methode, um alle Daten auf einmal zu erhalten
  get() {
    return {
      sessionStartTime: this.#sessionStartTime,
      cycles: this.#cycles,
      current_cycle: this.#current_cycle
    };
  }
}




function getCurrentCycle(){

let currentCycle = {};

if(s.cycles.length > 0){

  currentCycle = s.cycles[s.cycles.length - 1];
  //return s.cycles[s.cycles.length - 1];
}else{





    let initial_input = {
      textValue: '',
      cursorStart: 0,
      cursorEnd: 0
    }

    let initial_lastInput = {
      textValue: '',
      cursorStart: 0, // wird nicht verwendet
      cursorEnd: 0 // wird nicht verwendet
    }


    let initilal_ui_state = {
      displayElInnerHtml: '',
      displayElOldInnerHtml: '',
      input: initial_input,
      lastInput: initial_lastInput,
    }

    let initial_data_state = {
      written: '',
      lastWritten: '',
    }


    let initial_state = {
      ui_state: initilal_ui_state,
      data_state: initial_data_state,
      recordedManipulations: [],
    }


    currentCycle = {
      creationTime: Date.now(),
      endingTime: 0,
      startRecordTime: 0,
      stopRecordTime: 0,
      initial_state: initial_state,
      current_state: initial_state,
      final_state: {},
      isRecording: false,

    }





}


  return currentCycle;
}



export function initializeSession() {


  s = {
    sessionStartTime: Date.now(),
    cycles: [],
    current_cycle: getCurrentCycle(),
  }
  console.log("startSession()");


}

export function closeSession() {
  s = {};
  console.log("closeSession()");
}
