const apiUrl = "todo-api.php";
let editListener = null; // Holds the listener for accepting the edit of an item
let items = null; // Drag/Session: Holds the last GET itemlist
let backupLi = null;
let draggedItem = null; // Drag: Holds the currently dragged item
let draggedLi = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // fetch to GET todo elements
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => printTodoElements(data));

    // Add listener that POST fetches the new entry on submit of the todo-form
    document.getElementById('todo-form').addEventListener('submit', e => {
        e.preventDefault();
        const todoInput = document.getElementById('todo-input').value;
        fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ title: todoInput })
        })
        .then(response => response.json())
        .then(data => {
            const todoList = document.getElementById('todo-list');
            addTodoElement(todoList, data);
            document.getElementById('todo-input').value = "";
        });
    });

    document.getElementById('abort-edit').addEventListener('click', () => switchForms());
});

// Calls createTodo for the given item and adds the returned li to the given list
function addTodoElement(list, item) {
    const li = createTodoElement(item);
    list.appendChild(li);
}

// Adds the delete button with funtionality for the given item to the given li-element
function addDeleteButton(li, item) {
    const button = document.createElement('button');
    button.addEventListener('click', () => {
        fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'DELETE',
            body: JSON.stringify({ id: item.id })
        })
        .then(response => response.json())
        .then(data => {
            const li = document.getElementById(data['id']);
            li.remove();
        });
    });
    button.classList.add('del-btn');
    button.classList.add('material-symbols-outlined');
    button.innerHTML = 'delete_forever';
    li.appendChild(button);
}

// Adds the done button with funtionality for the given item to the given li-element
function addDoneButton(li, item) {
    const button = document.createElement('button');
    button.addEventListener('click', () => {
        item.done = li.classList.contains('done') ? 0 : 1;
        updateItem(item, false);
    });
    button.classList.add('done-btn');
    button.classList.add('material-symbols-outlined');
    button.innerHTML = 'check';
    li.appendChild(button);
}

// Adds everything needed for drag'n'drop to work
function addDragFunctionality(li, item) {
    li.setAttribute('draggable', 'true');
    li.addEventListener('dragstart', ev => {
        ev.dataTransfer.effectAllowed = 'move';
        ev.dataTransfer.setData('text/plain', item.id);
        draggedItem = item;
        draggedLi = getTargetLi(ev).cloneNode(true);
        backupLi = null;
    });
    li.addEventListener('dragenter', dragenter);
    li.addEventListener('dragover', ev => {
        if (ev.dataTransfer.types.includes('text/plain') && ev.dataTransfer.effectAllowed === 'move') {
            ev.preventDefault();
        }
    });
    li.addEventListener('drop', ev => {
        if (ev.dataTransfer.types.includes('text/plain') && ev.dataTransfer.effectAllowed === 'move') {
            ev.preventDefault();

            // TODO: Compare items with lis and PUT changes
        }
    });
}

// Adds the edit button with funtionality for the given item to the given li-element
function addEditButton(li, item) {
    const button = document.createElement('button');
    button.addEventListener('click', () => {
        const editForm = document.getElementById('edit-form');
        const editInput = document.getElementById('edit-input');

        if (editForm.classList.contains('hidden'))
            switchForms();
        editInput.value = item.title;

        editForm.removeEventListener('submit', editListener);
        editListener = (ev) => {
            ev.preventDefault();
            item.title = editInput.value;
            updateItem(item, true);
        }
        editForm.addEventListener('submit', editListener);
    });
    button.classList.add('edit-btn');
    button.classList.add('material-symbols-outlined');
    button.innerHTML = 'edit';
    li.appendChild(button);
}

/**
 * Return true, if the cursor is in the upper side of the given element during the given mouse-event
 * @param {*} element 
 * @param {*} event 
 * @returns 
 */
function beforeTarget(element, event) {
    const rect = element.getBoundingClientRect();
    const cursorY = event.clientY - rect.top;
    return cursorY < rect.height / 2;
}

// Checks if the given li element represents the given todo. This is checked first by id, then by completion state, then by title
function containsTodo(li, todo) {
    if (li.id !== todo.id) return false;
    if (li['ix'] == todo.ix) return false;
    if (li.classList.contains('done') && todo.done == 1) return false;
    const text = li.getElementsByTagName('span')[0];
    return text.textContent == todo.title;
}

// Deletes the dragShadow and returns a new one to place it
function createNewDragShadow() {
    if (dragShadow) dragShadow.remove();
    dragShadow = createTodoElement(dragged);
    dragShadow.classList.add('dropIn');
    return dragShadow;
}

// Creates a li-element for the given todo item
function createTodoElement(item) {
    const li = document.createElement('li');
    const text = document.createElement('span');
    li.id = item.id;
    li.setAttribute('ix', item.ix);
    if (item.done)
        li.classList.add('done');
    text.textContent = item.title;
    li.appendChild(text);
    addDragFunctionality(li, item);
    addDoneButton(li, item);
    addEditButton(li, item);
    addDeleteButton(li, item);
    return li;
}

// Removes and deletes the dragShadow
function deleteDragShadow() {
    if (dragShadow) dragShadow.remove();
    dragShadow = null;
}

function dragenter(ev) {
    if (ev.dataTransfer.types.includes('text/plain') && ev.dataTransfer.effectAllowed === 'move') {
        ev.preventDefault();
        const targetLi = getTargetLi(ev);
        if (targetLi && targetLi.tagName === "LI" && targetLi.id != draggedLi.id) {
            const ul = targetLi.parentNode;
            const prevLi = ul.querySelector(`li[id="${draggedLi.id}"]`);
            if (prevLi) {
                const clone = targetLi.cloneNode(true);
                clone.addEventListener("dragenter", dragenter);
                ul.replaceChild(clone, prevLi);
            }
            ul.replaceChild(draggedLi, targetLi);
        }
    }
}

// Returns the target li element of the given event
function getTargetLi(event) {
    let targetLi = event.target;
    while (targetLi.tagName !== 'LI') { // Go up the DOM if a child element is the drag-target
        targetLi = targetLi.parentNode;
        if (targetLi.tagName == 'UL' || targetLi.tagName == 'body') break; // Failsave
    }
    return targetLi;
}

/**
 * Inserts the given item into the itemslist.
 * @param {*} item A todo item
 */
function insertItem(item) {
    const { id, title, ix, done } = item;
    const newItem = { id, title, ix, done };
    const index = items.findIndex(el => el.id == id);
    if (index != -1)
        items[index] = newItem;
    else items.push(newItem);
}

/**
 * Prints the given data as todos into the ul#todoList 
 * OR inserts it to the items list and overrides existing li-elements.
 * @param {*} data An array of todo items
 * @param {*} update If true, the given todo items are merged with the existing ones
 */
function printTodoElements(data, update=false) {
    if (update && items && items.length > 0) {
        data.forEach(item => insertItem(item));
        items.sort((a, b) => a.ix - b.ix);
    }
    else items = data;
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    items.forEach(item => addTodoElement(todoList, item));
}

// Sets the todo-form hidden and the edit-form unhidden an vise versa
function switchForms() {
    document.getElementById('todo-form').classList.toggle('hidden');
    document.getElementById('edit-form').classList.toggle('hidden');
    document.getElementById('todo-input').value = "";
    document.getElementById('edit-input').value = "";
}

// Does a PUT request with the given item and updates the ul#todolist and the items list after response
function updateItem(item, editFormActive=false) {
    fetch(apiUrl, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify(item)
    })
    .then(response => response.json())
    .then(data => {
        printTodoElements([data], true);
        if (editFormActive)
            switchForms();
    });
}

/**
 * Fetches the given todo items as PUT, then inserts it into items list and ul#todolist.
 * @param {*} toUpdate 
 */
function updateItems(toUpdate) {
    fetch(apiUrl, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify({ items: toUpdate })
    })
    .then(response => response.json())
    .then(data => printTodoElements(data.items, true));
}