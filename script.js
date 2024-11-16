let draggedBox = null;
let sourceCell = null;
let actionStack = []; // To track actions for undo
let nextBoxId = 100; // Starting ID for boxes

// Initialize the table with 3x3 boxes
function initializeTable() {
  const table = document.getElementById('dragDropTable');

  for (let i = 0; i < 3; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 3; j++) {
      const cell = document.createElement('td');
      const box = createBox(nextBoxId);
      nextBoxId += 100;
      cell.appendChild(box);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

// Create a draggable box
// Keep track of used colors
let usedColors = []; 

function createBox(id) {
  const box = document.createElement('div');
  box.classList.add('box');
  box.id = id;
  box.draggable = true;
  box.textContent = id;

  //colors
  const Colors = [
    '#3B9E9A', '#4682B4', '#5F9EA0', '#2E8B57', '#2F4F4F', '#6A5ACD', '#8A2BE2', '#20B2AA', '#32CD32', '#5F9EAD',
    '#6B8E23', '#4B0082', '#800080', '#3CB371', '#B0C4DE', '#A9A9A9', '#708090', '#5C4033', '#6B4226', '#8FBC8F',
    '#C0C0C0', '#B0E0E6', '#8A9A5B', '#7FFFD4', '#4682B4', '#7B68EE', '#D8BFD8', '#B0E0E6'
  ];

  // Filter out colors that have already been used
  const availableColors =   Colors.filter(color => !usedColors.includes(color))
  // If no more available colors, reset the usedColors list
  if (availableColors.length === 0) {
    usedColors = [];
  }
  // Choose a random color from the available ones
  const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
  // Assign the color to the box
  box.style.backgroundColor = randomColor;
  // Mark the color as used
  usedColors.push(randomColor);
  // Add drag-and-drop listeners to the box
  addDragDropListeners(box);
  return box;
}


// Add drag-and-drop listeners to a box
function addDragDropListeners(box) {
  box.addEventListener('dragstart', () => {
    draggedBox = box;
    sourceCell = draggedBox.parentNode;
    draggedBox.classList.add('dragging');
  });

  box.addEventListener('dragend', () => {
    draggedBox.classList.remove('dragging');
    draggedBox = null;
    sourceCell = null;
  });
}

// Enable cells as drop targets
function enableCellDrop() {
  document.querySelectorAll('td').forEach(cell => {
    cell.addEventListener('dragover', (e) => e.preventDefault());
  
    cell.addEventListener('drop', () => {
      if (cell !== sourceCell) {
        const destinationBox = cell.firstElementChild;

        // If there is already a box in the destination cell, replace it
        if (destinationBox) {
          actionStack.push({
            type: 'move',
            from: sourceCell,
            to: cell,
            movedBox: draggedBox,
            replacedBox: destinationBox
          });
          sourceCell.appendChild(destinationBox); // Move the replaced box back to the source cell
        } else {
          // If no box is in the destination cell, just move the dragged box
          actionStack.push({
            type: 'move',
            from: sourceCell,
            to: cell,
            movedBox: draggedBox
          });
        }
        // Move the dragged box to the new destination
        cell.appendChild(draggedBox);
      }
    });
  });
}

// Undo the last action
document.getElementById('undoAction').addEventListener('click', () => {
  if (actionStack.length > 0) {
    const lastAction = actionStack.pop();
  
    if (lastAction.type === 'move') {
      const { from, to, movedBox, replacedBox } = lastAction;
  
      // Move the dragged box back to the original position (from cell)
      from.appendChild(movedBox);
      // If a box was replaced, return it to its original position
      if (replacedBox) {
        to.appendChild(replacedBox);
      }
    }
  // Adjust the ID counter for the removed row
    if (lastAction.type === 'addRow') {
      const { row } = lastAction;
      row.remove();
      nextBoxId -= 300; 
    }
  }
});

// Add a new row to the table
document.getElementById('addRow').addEventListener('click', () => {
  const table = document.getElementById('dragDropTable');
  const newRow = document.createElement('tr');

  for (let i = 0; i < 3; i++) {
    const cell = document.createElement('td');
    const box = createBox(nextBoxId);
    nextBoxId += 100;
    cell.appendChild(box);
    newRow.appendChild(cell);
  }

  table.appendChild(newRow);
  actionStack.push({ type: 'addRow', row: newRow });
  enableCellDrop();
});

// Initialize the application
initializeTable();
enableCellDrop();



