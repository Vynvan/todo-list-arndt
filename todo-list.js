const apiUrl = "todo-api.php";
let editListener = null; // Holds the listener for accepting the edit of an item
let items = null; // Drag/Session: Holds the last GET itemlist
let dragged = null; // Drag: Holds the currently dragged item
let dragShadow = null; // Drag: Holds the li element that shows the current target position during a drag operation

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
        item.done = !li.classList.contains('done');
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
        dragged = item;
        dragShadow = null;
    });
    li.addEventListener('dragenter', ev => {
        if (ev.dataTransfer.types.includes('text/plain') && ev.dataTransfer.effectAllowed === 'move')
            ev.preventDefault();
    });
    li.addEventListener('dragover', ev => {
        if (ev.dataTransfer.types.includes('text/plain') && ev.dataTransfer.effectAllowed === 'move') {
            ev.preventDefault();
            ev.dataTransfer.dropEffect = 'move';
            
            // Get the target li element
            let targetLi = getTargetLi(ev);
            if (targetLi.tagName !== 'LI' || targetLi.id === dragged.id || targetLi === dragShadow) return;
            
            // Find the position the dragShadow should be
            const before = beforeTarget(targetLi, ev);

            // Set dragShadow if it doesn't exist or is in the wrong place
            if (before && (!dragShadow || dragShadow.id !== targetLi.previousSibling.id))
                targetLi.parentNode.insertBefore(createNewDragShadow(), targetLi);
            else if (!before && targetLi.nextSibling && (!dragShadow || dragShadow.id !== targetLi.nextSibling.id))
                targetLi.parentNode.insertBefore(createNewDragShadow(), targetLi.nextSibling);
            else if (!before && !targetLi.nextSibling)
                targetLi.parentNode.appendChild(createNewDragShadow());
        }
    });
    li.addEventListener('drop', ev => {
        if (ev.dataTransfer.types.includes('text/plain') && ev.dataTransfer.effectAllowed === 'move') {
            ev.preventDefault();

            // Get the target li element
            let targetLi = getTargetLi(ev);
            if (targetLi.nextSibling.id == dragged.id || targetLi.previousSibling.id == dragged.id) {
                deleteDragShadow();
                console.log("target.id == sibling.id")
                return;
            }

            // Make sure the target li element isn't the dragShadow, but a real li element
            if (targetLi === dragShadow) {
                const sibling = targetLi.nextSibling ?? targetLi.previousSibling;
                const siblingIx = items.find(el => el.id == sibling.id).ix;
                targetLi = siblingIx < dragged.ix ? targetLi.previousSibling ?? sibling : sibling;
                console.log("target was shadow, is now '" + sibling.children[0].textContent + "'")
            }
            const targetItem = items.find(el => el.id == targetLi.id);
            let startIx = dragged.ix < targetItem.ix ? dragged.ix : targetItem.ix;
            const lastIx = dragged.ix < targetItem.ix ? targetItem.ix : dragged.ix;
            const toUpdate = items.filter(el => el.ix >= startIx && el.ix <= lastIx);
            console.log("startIx=" + startIx + ", lastIx=" + lastIx + ", Items to update=" + toUpdate.length + " (" + toUpdate.reduce((out, cur) => out + "," + cur.title, "") + ")")
            toUpdate.forEach(el => el.ix = startIx++);
            updateItems(toUpdate);
            dragShadow.classList.remove('dropIn');
        }
        deleteDragShadow();
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

// Return true, if the cursor is in the upper side of the given element during the given event
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
    dragShadow.remove();
    dragShadow = null;
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

// Prints the given data as todos into the ul#todoList OR updates the existing data by overriding existing li-elements
function printTodoElements(data, update=false) {
    items = data;
    const todoList = document.getElementById('todo-list');
    data.forEach(item => {
        if (update) {
            const oldLi = todoList.querySelector(`li[ix="${item.ix}"]`);
            if (!containsTodo(oldLi, data)) {
                const newLi = createTodoElement(item);
                oldLi.outerHTML = newLi.outerHTML;
            }
        }
        else addTodoElement(todoList, item);
    });
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
        const item = items[items.find(el => el.id == data['id'])] ?? {};
        const li = document.getElementById(data['id']);
        if (data['title']) {
            const span = li.getElementsByTagName('span')[0];
            span.textContent = data['title'];
            item.title = data['title'];
        }
        if (data['done']) {
            li.classList.add('done');
            item.done = 1;
        }
        else {
            li.classList.remove('done');
            item.done = 0;
        }
        if (editFormActive)
            switchForms();
    });
}

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