let draggedBox = null; // The box currently being dragged
let sourceCell = null; // The cell from which the box is being dragged
let actionStack = []; // Stack to track actions for undo
let redoStack = []; // Stack to track actions for redo
let nextBoxId = 100; // Starting ID for boxes

/**
 * Initialize the table with 3x3 boxes.
 */
function initializeTable() {
  const table = document.getElementById('dragDropTable');
  for (let i = 0; i < 3; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 3; j++) {
      const cell = document.createElement('td');
      const box = createBox(nextBoxId);
      nextBoxId += 100; // Increment box ID for the next box
      cell.appendChild(box);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}


let usedColors = []; // Track used colors to avoid duplication

function createBox(id) {
  const box = document.createElement('div');
  box.classList.add('box');
  box.id = id;
  box.draggable = true;
  box.textContent = id; // Display box ID

  // Colors for the boxes
  const Colors = [
    '#3B9E9A', '#4682B4', '#5F9EA0', '#2E8B57', '#2F4F4F', '#6A5ACD', '#8A2BE2', '#20B2AA', '#32CD32', '#5F9EAD',
    '#6B8E23', '#4B0082', '#800080', '#3CB371', '#B0C4DE', '#A9A9A9', '#708090', '#5C4033', '#6B4226', '#8FBC8F',
    '#C0C0C0', '#B0E0E6', '#8A9A5B', '#7FFFD4', '#4682B4', '#7B68EE', '#D8BFD8', '#B0E0E6'
  ];

  // Filter out already used colors
  const availableColors = Colors.filter(color => !usedColors.includes(color));
  if (availableColors.length === 0) {
    usedColors = []; // Reset used colors if all are used
  }

  // Assign a random color from available options
  const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
  box.style.backgroundColor = randomColor;
  usedColors.push(randomColor); // Mark this color as used

  addDragDropListeners(box); // Add drag-and-drop listeners
  return box;
}


function addDragDropListeners(box) {
  box.addEventListener('dragstart', () => {
    draggedBox = box;
    sourceCell = draggedBox.parentNode;
    draggedBox.classList.add('dragging'); // Visual indication of dragging
  });

  box.addEventListener('dragend', () => {
    draggedBox.classList.remove('dragging'); // Remove dragging indication
    draggedBox = null;
    sourceCell = null;
  });
}

/**
 * Enables cells as drop targets for the draggable boxes.
 */
function enableCellDrop() {
  document.querySelectorAll('td').forEach(cell => {
    // Allow drop by preventing default behavior
    cell.addEventListener('dragover', (e) => e.preventDefault());

    // Handle the drop action
    cell.addEventListener('drop', () => {
      if (cell !== sourceCell) {
        const destinationBox = cell.firstElementChild;

        // Prepare the action object for undo/redo stack
        const action = {
          type: 'move',
          from: sourceCell,
          to: cell,
          movedBox: draggedBox,
          replacedBox: destinationBox || null, // Handle the case when no box is replaced
        };

        // Perform the move operation
        if (destinationBox) {
          sourceCell.appendChild(destinationBox); // Move the replaced box back to the source cell
        }
        cell.appendChild(draggedBox); // Move the dragged box to the new cell

        // Push the action to the stack and clear redo stack
        actionStack.push(action);
        redoStack = []; // Clear redo stack on a new action
      }
    });
  });
}

/**
 * Undo the last action performed.
 */
document.getElementById('undoAction').addEventListener('click', () => {
  if (actionStack.length > 0) {
    const lastAction = actionStack.pop();
    redoStack.push(lastAction); // Push the undone action to the redo stack

    if (lastAction.type === 'move') {
      const { from, to, movedBox, replacedBox } = lastAction;

      // Move the dragged box back to the original position
      from.appendChild(movedBox);
      // If a box was replaced, return it to its original position
      if (replacedBox) {
        to.appendChild(replacedBox);
      }
    }

    if (lastAction.type === 'addRow') {
      const { row } = lastAction;
      row.remove(); // Remove the entire row
      nextBoxId -= 300; // Adjust the ID counter
    }
  }
});

/**
 * Redo the last undone action.
 */
document.getElementById('redoAction').addEventListener('click', () => {
  if (redoStack.length > 0) {
    const lastRedo = redoStack.pop(); // Get the last undone action
    actionStack.push(lastRedo); // Push the redone action back to the action stack

    if (lastRedo.type === 'move') {
      const { from, to, movedBox, replacedBox } = lastRedo;

      // Move the dragged box to its new position
      to.appendChild(movedBox);

      // If a box was replaced, move it back to its destination
      if (replacedBox) {
        from.appendChild(replacedBox);
      }
    }

    if (lastRedo.type === 'addRow') {
      const { row } = lastRedo;
      document.getElementById('dragDropTable').appendChild(row);
      nextBoxId += 300; // Adjust the ID counter
    }
  }
});

/**
 * Add a new row of boxes to the table.
 */
document.getElementById('addRow').addEventListener('click', () => {
  const table = document.getElementById('dragDropTable');
  const newRow = document.createElement('tr');
  const boxes = []; // To track the new boxes added in this row

  for (let i = 0; i < 3; i++) {
    const cell = document.createElement('td');
    const box = createBox(nextBoxId);
    nextBoxId += 100; // Increment box ID for the next box
    cell.appendChild(box);
    newRow.appendChild(cell);
    boxes.push({ cell, box });
  }

  table.appendChild(newRow);
  
  // Push a single unified action for adding a row
  actionStack.push({ type: 'addRow', row: newRow, boxes });
  redoStack = []; // Clear redo stack on a new action
  enableCellDrop(); // Enable drag-and-drop for the new row
});

// Initialize the application
initializeTable();
enableCellDrop();
