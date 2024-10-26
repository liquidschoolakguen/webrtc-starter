export function createMirrorSync(textareaId, mirrorId) {
  const textarea = document.getElementById(textareaId);
  const mirror = document.getElementById(mirrorId);


  function focusTextarea() {  //setze fokus auf das textarea


  }

  if (textarea === document.getElementById('chat-inputX')) {
    setTimeout(() => {
      textarea.focus();
    }, 100);
  }

  function escapeHTML(char) {
      const charCode = char.charCodeAt(0);
      if (char === '&') return '&amp;';
      if (char === '<') return '&lt;';
      if (char === '>') return '&gt;';
      if (char === '"') return '&quot;';
      if (char === "'") return '&#039;';
      if (char === '\n') return '<br>';
      return char;
  }





  function updateMirror() {
      const value = textarea.value;

      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;

      let content = '';
      const totalLength = value.length;

      // Array zum Speichern der Zeichen und eventueller Spans
      const chars = [];

      for (let i = 0; i < totalLength; i++) {
          const originalChar = value[i];
          const escapedChar = escapeHTML(originalChar);
          let spanStart = '';
          let spanEnd = '';

          // Simuliere den Cursor an der richtigen Position
          if (i === selectionStart) {
              chars.push('<span class="cursor"></span>');
          }

          // Hervorhebung ab Position 20
          if (i >= 20) {
              spanStart += '<span class="highlight">';
              spanEnd = '</span>' + spanEnd;
          }

          // Simuliere die Textauswahl
          if (i >= selectionStart && i < selectionEnd) {
              spanStart += '<span class="selection">';
              spanEnd = '</span>' + spanEnd;
          }

          chars.push(spanStart + escapedChar + spanEnd);
      }

      // Falls der Cursor am Ende des Textes steht
      if (selectionStart === totalLength) {
          chars.push('<span class="cursor"></span>');
      }

      content = chars.join('');

      mirror.innerHTML = content;

      syncScroll();
  }

  function syncScroll() {
      mirror.scrollTop = textarea.scrollTop;
      mirror.scrollLeft = textarea.scrollLeft;
  }

  textarea.addEventListener('input', updateMirror);
  textarea.addEventListener('scroll', syncScroll);
  textarea.addEventListener('click', updateMirror);
  textarea.addEventListener('keyup', updateMirror);
  textarea.addEventListener('select', updateMirror);



  // Initialer Aufruf
  updateMirror();
}
