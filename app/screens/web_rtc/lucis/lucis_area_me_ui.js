
import { checkAreaMeChanges, syncScroll, getCharIndexAtPosition, setNewCursorPositionInInputArea} from './lucis_area_me_session.js';


export function createSyncAreaMe() {
    // Auswahl-Handling
    let isSelecting = false;
    let selectionStartIndex = 0;

    const textarea = document.getElementById('chat-inputX');
    textarea.addEventListener('input', checkAreaMeChanges);
    textarea.addEventListener('scroll', syncScroll);
    textarea.addEventListener('keyup', checkAreaMeChanges);









    textarea.addEventListener('mousedown', function(event) {
      isSelecting = true;
      selectionStartIndex = getCharIndexAtPosition(event);
      setNewCursorPositionInInputArea(selectionStartIndex, selectionStartIndex);
    });

    textarea.addEventListener('mousemove', function(event) {
      if (isSelecting) {
        const selectionEndIndex = getCharIndexAtPosition(event);

        if(selectionEndIndex > selectionStartIndex) {
            setNewCursorPositionInInputArea(selectionStartIndex, selectionEndIndex);

        }else{
            setNewCursorPositionInInputArea(selectionEndIndex, selectionStartIndex);
        }
      }
    });

    textarea.addEventListener('mouseup', function(event) {
      if (isSelecting) {
        isSelecting = false;

        const selectionEndIndex = getCharIndexAtPosition(event);

        if(selectionEndIndex > selectionStartIndex) {
            setNewCursorPositionInInputArea(selectionStartIndex, selectionEndIndex);

        }else{
            setNewCursorPositionInInputArea(selectionEndIndex, selectionStartIndex);
        }


      }
    });









}
