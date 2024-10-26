




class Construction {
  constructor(manipulation) {
    this.manipulation = manipulation;
    this.display = '';
    this.displayOld = '';
    this.construction = '';
  }


  constructEl() {












    return this.construction;
  }


}

class Manipulation {
  constructor() {
    this.to_add = '';
    this.to_delete = '';
    this.cursorStart = 0;
    this.cursorEnd = 0;
    this.timestamp = Date.now();

  }
}



export class Data {
  constructor() {
    this.inputValue = '';
    this.inputCS = 0;
    this.inputCE = 0;
    this.lastInputValue = '';
    this.manipulation = '';
    this.manipulations = [];
    this.constructionValue = '';
    this.constructionCS = 0;
    this.constructionCE = 0;
    this.lastConstructionValue = '';

    this.ownManipulation = {};
    this.remoteManipulation = {};

  }


  setInputs(inputValue, inputCS, inputCE) {
    this.inputValue = inputValue;
    this.inputCS = inputCS;
    this.inputCE = inputCE;



  }
  getInputs() {
    return {
      inputValue: this.inputValue,
      inputCS: this.inputCS,
      inputCE: this.inputCE
    };
  }

  createNewManipulation() {

    //const m = new Manipulation();

    let lastInputValue = this.lastInputValue;
    let inputValue = this.inputValue;
    let inputCS = this.inputCS; //cursorStart
    let inputCE = this.inputCE; //cursorEnd

    const manipulation = {
      to_add: '',
      to_delete: '',
      cursorStart: inputCS,
      cursorEnd: inputCE,
      timestamp: Date.now()
    };

    const copy = manipulation;

    //kontrolliere ob die cursorStart und cursorEnd gleich sind
    if (inputCS === inputCE) {


      // Finde den Startindex, ab dem sich die Texte unterscheiden
      let start = 0;
      while (
        start < lastInputValue.length &&
        start < inputValue.length &&
        lastInputValue[start] === inputValue[start]
      ) {
        start++;
      }

      // Finde den Endindex der Unterschiede
      let endOld = lastInputValue.length;
      let endNew = inputValue.length;
      while (
        endOld > start &&
        endNew > start &&
        lastInputValue[endOld - 1] === inputValue[endNew - 1]
      ) {
        endOld--;
        endNew--;
      }

      manipulation.to_delete = lastInputValue.slice(start, endOld);
      manipulation.to_add = inputValue.slice(start, endNew);



    } else {

      // gebe mir den substring von newText von newCursorStart bis newCursorEnd
      //manipulation.to_add = inputValue.substring(inputCS, inputCE);
      //manipulation.to_delete = lastInputValue.substring(inputCS, inputCE);

    }
    //kontrolliere ob die manipulation unterschiedlich ist
    // if (manipulation.to_add !== copy.to_add || manipulation.to_delete !== copy.to_delete || manipulation.cursorStart !== copy.cursorStart || manipulation.cursorEnd !== copy.cursorEnd) {
    this.manipulation = manipulation;
    this.manipulations.push(manipulation);
    //} else {
    //  console.log('manipulation is the same as copy');
    //}



  }



  createConstruction() {
    let manipulation = this.manipulation;
    let lastConstructionValue = this.lastConstructionValue;
    let constructionValue = '';







    if (manipulation.cursorStart === manipulation.cursorEnd) {
      // Wenn kein Text markiert war
      let start = manipulation.cursorStart;
      console.log('');
      console.log('');
      console.log('start', start);
      console.log('lastConstructionValue', lastConstructionValue);

      const addLength = manipulation.to_add.length;
      const delLength = manipulation.to_delete.length;



        let startPart = lastConstructionValue.slice(0, start - addLength )
        let deletedPart = manipulation.to_delete;
        let deletedPart2 = lastConstructionValue.slice(start - addLength, start - addLength + delLength )
        let endPart = lastConstructionValue.slice(start -addLength + delLength);

        constructionValue = startPart +
        manipulation.to_add +
        endPart;

        console.log('deletedPart', deletedPart,  deletedPart2);



       // constructionValue = lastConstructionValue;


      this.constructionValue = constructionValue;
      console.log('constructionValue', constructionValue);

      // Aktualisiere lastConstructionValue für den nächsten Durchlauf
      this.lastConstructionValue = constructionValue;

    } else {

    }

    // Aktualisiere die Cursor-Positionen
    this.constructionCS = manipulation.cursorStart;
    this.constructionCE = manipulation.cursorEnd;








  }


}



export class Cycle {
  constructor() {
    this.creationTime = Date.now();
    this.startRecordTime = 0;
    this.stopRecordTime = 0;
    this.data = new Data();
    this.isRecording = false;
    this.display = null;
    this.displayOld = null;


  }



}



export class User {
  constructor(userName) {
    this.userName = userName;
  }
}

export class LucisSession {
  constructor() {
    this.sessionStartTime = Date.now();
    this.remoteUser = null;
    this.cycles = [];
    this.cycle = null;
    this.gift = false;
    //this.createNewCycle();
  }

  createNewCycle() {

    console.log('createNewCycle');
    const cycle = new Cycle();
    this.cycle = cycle;
    this.cycles.push(cycle);

    // übertrage die inputValue des letzten Cycles auf die lastInputValue der neuen cycle
    if (this.cycles.length > 1) {
      const lastCycle = this.cycles[this.cycles.length - 2];
      this.cycle.data.lastInputValue = lastCycle.data.inputValue;
      this.cycle.display = lastCycle.data.display;
      this.cycle.displayOld = lastCycle.data.displayOld;
    } else {
      this.cycle.data.lastInputValue = '';
    }

  }

  setRemoteUserByName(userName) {
    this.remoteUser = new User(userName);
  }
}

export class App {
  constructor(userName) {
    this.meUser = new User(userName);
    this.lucisSession = null;
    this.lucisSessions = [];
  }


  createNewLucisSession() {

    console.log('createNewLucisSession');
    const session = new LucisSession();
    this.lucisSession = session;
    this.lucisSessions.push(session);

  }

  resetLucisSession() {
    this.lucisSession = null;
    this.lucisSessions = [];
    this.createNewLucisSession();
  }
}
