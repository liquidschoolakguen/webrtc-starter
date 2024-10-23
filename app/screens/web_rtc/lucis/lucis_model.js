export class Input {
  constructor() {
    this.textValue = '';
    this.cursorStart = 0;
    this.cursorEnd = 0;
  }
}

export class UI {
  constructor() {
    this.displayElInnerHtml = '';
    this.displayElOldInnerHtml = '';
    this.input = new Input();
    this.lastInput = new Input();
  }
}

export class Data {
  constructor() {
    this.written = '';
    this.lastWritten = '';
  }
}

export class State {
  constructor() {
    this.ui = new UI();
    this.data = new Data();
  }
}

export class Cycle {
  constructor() {
    this.creationTime = Date.now();
    this.startRecordTime = 0;
    this.stopRecordTime = 0;
    this.initial_state = new State();
    this.current_state = new State();
    this.final_state = new State();
    this.isRecording = false;
  }
}

export class LucisSession {
  constructor() {
    this.sessionStartTime = Date.now();
    this.cycles = [];
    this.current_cycle = null;
    this.createNewCycle();
  }

  createNewCycle() {


    const cycle = new Cycle();
    this.current_cycle = cycle;
    this.cycles.push(cycle);



  }
}
