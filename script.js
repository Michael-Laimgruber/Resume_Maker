// ==== GLOBALS ====
// ==== WORKS DONT CHANGE ====
const preview = document.getElementById('preview');
const toolbar = document.getElementById('toolbar_global');

let activeWrapper = null;
let columnCount = 1;

// ==== CREATE DRAG HANDLE ====
// ==== WORKS DONT CHANGE ====
function createDragHandle() {
  const dragHandle = document.createElement('button');
  dragHandle.className = 'drag-handle';
  dragHandle.title = 'Drag to reorder';
  dragHandle.innerHTML = '≡';
  dragHandle.type = 'button';
  dragHandle.style.userSelect = 'none';
  return dragHandle;
}

// ==== CREATE DELETE BUTTON ====
// ==== WORKS DONT CHANGE ====
function createDeleteButton(wrapper) {
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '✖';
  deleteBtn.type = 'button';
  deleteBtn.onclick = () => wrapper.remove();
  return deleteBtn;
}

// ==== CREATE TEXTBOX WRAPPER ====
// ==== WORKS DONT CHANGE ====
function createTextboxWrapper(text = 'Enter your text here...') {
  const wrapper = document.createElement('div');
  wrapper.className = 'textbox-wrapper';

  const box = document.createElement('div');
  box.className = 'textbox';
  box.style.display = 'flex';
  box.style.gap = '6px';
  box.contentEditable = false;  // container not editable

  const col = document.createElement('div');
  col.className = 'textbox-column';
  col.contentEditable = true;
  col.style.flex = '1';
  col.style.minWidth = '0';
  col.style.whiteSpace = 'pre-wrap';
  col.style.wordBreak = 'break-word';
  col.innerText = text;

  box.appendChild(col);

  const deleteBtn = createDeleteButton(wrapper);
  const dragHandle = createDragHandle();

  wrapper.appendChild(deleteBtn);
  wrapper.appendChild(box);
  wrapper.appendChild(dragHandle);

  textboxResizeObserver.observe(wrapper);


  return wrapper;
}


// ==== RESIZE TEXTBOX WRAPPER ====
const textboxResizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const wrapper = entry.target;
    if (!wrapper.classList.contains('textbox-wrapper')) continue;

    const textbox = wrapper.querySelector('.textbox');
    if (!textbox) continue;

    const columns = [...textbox.querySelectorAll('.textbox-column')];
    if (columns.length <= 1) return;

    // Combine all text from columns
    const allText = columns.map(col => col.innerText).join(' ');
    const words = allText.split(/\s+/); // split by whitespace

    const wordsPerCol = Math.ceil(words.length / columns.length);

    columns.forEach((col, i) => {
      const slice = words.slice(i * wordsPerCol, (i + 1) * wordsPerCol);
      col.innerText = slice.join(' ');
    });
  }
});



// ==== CREATE LINE WRAPPER ====
// ==== WORKS DONT CHANGE ====
function createLineWrapper() {
  const wrapper = document.createElement('div');
  wrapper.className = 'line-wrapper';

  const line = document.createElement('hr');
  line.className = 'line';

  const deleteBtn = createDeleteButton(wrapper);
  const dragHandle = createDragHandle();

  wrapper.appendChild(deleteBtn);
  wrapper.appendChild(line);
  wrapper.appendChild(dragHandle);

  return wrapper;
}

// ==== UPDATE ACTIVE TEXTBOX ====
function updateActiveTextbox(wrapper) {
  if (activeWrapper) activeWrapper.classList.remove('active-textbox');
  activeWrapper = wrapper;
  if (activeWrapper) activeWrapper.classList.add('active-textbox');

  if (activeWrapper) {
    const box = activeWrapper.querySelector('.textbox');
    columnCount = parseInt(box.style.columnCount) || 1;
  }
}

// ==== ADD TEXTBOX HANDLER ====
document.getElementById('add-textbox').addEventListener('click', () => {
  const wrapper = createTextboxWrapper();
  preview.appendChild(wrapper);
  wrapper.querySelector('.textbox').focus();
});

// ==== ADD LINE HANDLER ====
document.getElementById('add-line').addEventListener('click', () => {
  const wrapper = createLineWrapper();
  preview.appendChild(wrapper);
});


// ==== FOCUS TRACKING ====
function resolveActiveWrapperFromSelection() {
  const selection = window.getSelection();
  if (!selection || !selection.anchorNode) return null;

  const node = selection.anchorNode.nodeType === 3
    ? selection.anchorNode.parentElement
    : selection.anchorNode;

  return node.closest('.textbox-wrapper');
}

document.addEventListener('selectionchange', () => {
  const wrapper = resolveActiveWrapperFromSelection();
  if (wrapper !== activeWrapper) {
    console.log('Active wrapper changed via selection');
    updateActiveTextbox(wrapper);
  }
});


// ==== TOOLBAR BUTTONS ====

// Formatting commands with data-cmd attribute //
const formatCommands = [
  'bold',
  'italic',
  'underline',
  'insertUnorderedList',
  'justifyLeft',
  'justifyCenter',
  'justifyRight',
  'justifyFull',
];

// Add click listeners to formatting buttons
// Add click listeners to formatting buttons
formatCommands.forEach(cmd => {
  const btn = document.querySelector(`[data-cmd="${cmd}"]`);
  if (!btn) return;

  if (cmd === 'justifyFull') {
    btn.addEventListener('click', () => {
      if (!activeWrapper) {
        console.log('No active textbox wrapper.');
        return;
      }

      const columns = activeWrapper.querySelectorAll('.textbox-column');
      if (columns.length) {
        const allJustified = [...columns].every(col => col.classList.contains('justify-full'));
        columns.forEach(col => {
          col.classList.toggle('justify-full', !allJustified);
          console.log(`${allJustified ? 'Removed' : 'Added'} justify-full`);
        });
      } else {
        const textbox = activeWrapper.querySelector('.textbox');
        if (!textbox) return;
        textbox.classList.toggle('justify-full');
        console.log(`${textbox.classList.contains('justify-full') ? 'Added' : 'Removed'} justify-full from textbox`);
      }
    });
  } else {
    btn.addEventListener('click', () => {
      if (!activeWrapper) return;

      // Remove custom justify-full first
      const columns = activeWrapper.querySelectorAll('.textbox-column');
      columns.forEach(col => col.classList.remove('justify-full'));

      const textbox = activeWrapper.querySelector('.textbox');
      if (textbox) textbox.classList.remove('justify-full');

      console.log(`Executing command: ${cmd}`);
      document.execCommand(cmd);
    });
  }
});


// Update active state on selection change for formatting buttons
document.addEventListener('selectionchange', () => {
  formatCommands.forEach(cmd => {
    const btn = document.querySelector(`[data-cmd="${cmd}"]`);
    if (!btn) return;
    if (document.queryCommandState(cmd)) {
      btn.classList.add('active-format');
      console.log(`Button "${cmd}" activated`);
    } else {
      btn.classList.remove('active-format');
      console.log(`Button "${cmd}" deactivated`);
    }
  });
});



/* TOOLBAR BUTTONS END */





/* SPLIT TEXTBOX */



// Utility: get current active textbox-column inside textbox-wrapper
function getActiveTextboxWrapper() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;
  let node = selection.anchorNode;
  while (node && !node.classList?.contains('textbox-wrapper')) {
    node = node.parentNode;
  }
  return node;
}

// Split columns +1
document.getElementById('split-columns-add').addEventListener('click', () => {
  const wrapper = getActiveTextboxWrapper();
  if (!wrapper) return;

  const textbox = wrapper.querySelector('.textbox');
  const columns = [...textbox.querySelectorAll('.textbox-column')];

  // Gather all text lines from all columns
  const allLines = columns.flatMap(col => col.innerText.split('\n'));

  // New column count
  const newCount = columns.length + 1;

  // Clear existing columns
  textbox.innerHTML = '';

  // Calculate lines per column (rough equal split)
  const linesPerCol = Math.ceil(allLines.length / newCount);

  // Create new columns and assign lines
  for (let i = 0; i < newCount; i++) {
    const col = document.createElement('div');
    col.className = 'textbox-column';
    col.contentEditable = true;
    col.style.flex = '1';
    col.style.minWidth = '0';

    const linesForThisCol = allLines.slice(i * linesPerCol, (i + 1) * linesPerCol);
    col.innerText = linesForThisCol.join('\n');
    textbox.appendChild(col);
  }
});

// Remove columns -1
document.getElementById('split-columns-remove').addEventListener('click', () => {
  const wrapper = getActiveTextboxWrapper();
  if (!wrapper) return;

  const textbox = wrapper.querySelector('.textbox');
  const columns = [...textbox.querySelectorAll('.textbox-column')];

  if (columns.length <= 1) return; // can't remove last column

  // Merge all text lines from columns back to a single array
  const allLines = columns.flatMap(col => col.innerText.split('\n'));

  // New column count
  const newCount = columns.length - 1;

  // Clear existing columns
  textbox.innerHTML = '';

  // Calculate lines per column (rough equal split)
  const linesPerCol = Math.ceil(allLines.length / newCount);

  // Create new columns and assign lines
  for (let i = 0; i < newCount; i++) {
    const col = document.createElement('div');
    col.className = 'textbox-column';
    col.contentEditable = true;
    col.style.flex = '1';
    col.style.minWidth = '0';

    const linesForThisCol = allLines.slice(i * linesPerCol, (i + 1) * linesPerCol);
    col.innerText = linesForThisCol.join('\n');
    textbox.appendChild(col);
  }
});



/* SPLIT BEHAVIOR */



















/* SPLIT TEXTBOX END */
















/* // Listen for selection change events
document.addEventListener('selectionchange', () => {
  updateToolbarButtons();
});
 */



// ==== SORTABLE DRAG & DROP ====
new Sortable(preview, {
  animation: 150,
  handle: '.drag-handle',
  forceFallback: true, // <-- critical fix for resizing + dnd
  fallbackTolerance: 3,
  onStart: evt => evt.item.style.opacity = '0.5',
  onEnd: evt => {
    evt.item.style.opacity = '';
    Array.from(preview.children).forEach(child => {
      child.style.transform = '';
      child.style.transition = '';
    });
  },
  onMove: evt => {
    if (evt.related) {
      evt.related.style.transition = 'transform 0.2s ease';
      evt.related.style.transform = 'scale(1.05)';
    }
    Array.from(preview.children).forEach(child => {
      if (child !== evt.related) child.style.transform = '';
    });
  },
});




// ==== EXPORT PDF ====
document.getElementById('export-pdf').addEventListener('click', () => {
  document.querySelectorAll('.textbox').forEach(box => {
    if (box.innerText.trim() === 'Enter your text here...') box.innerText = '';
  });
  const element = document.getElementById('preview');
  html2pdf().from(element).set({
    margin: 0,
    filename: 'resume.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, logging: false, scrollX: 0, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).save();
});



/* LOGGING */

console.log('Script loaded');

['bold','italic','underline','insertUnorderedList','justifyLeft','justifyCenter','justifyRight','justifyFull'].forEach(cmd => {
  const btn = document.querySelector(`[data-cmd="${cmd}"]`);
  if(btn) console.log(`Found button for ${cmd}`);
  else console.log(`Missing button for ${cmd}`);
});






// ==== RESET FUNCTION (example default content) ====
/* function loadDefaultResume() {
  preview.innerHTML = ''; // clear

  const intro = createTextboxWrapper('Your Name\nYour Address\nYour Phone\nYour Email');
  const objective = createTextboxWrapper('Objective:\nWrite your career objective here...');
  const line = createLineWrapper();
  const experience = createTextboxWrapper('Experience:\n- Company A\n- Company B');

  preview.appendChild(intro);
  preview.appendChild(objective);
  preview.appendChild(line);
  preview.appendChild(experience);
  updateActiveTextbox(null);
}
  
// Load default resume on startup
loadDefaultResume();
 */