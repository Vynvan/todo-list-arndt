const apiUrl = "todo-api.php";
let editListener = null;
let items = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // Define the URL to our PHP API
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => printItems(data));

    // Add listener that posts the new entry of the todo-form
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
            addTodo(todoList, data);
            document.getElementById('todo-input').value = "";
        });
    });

    document.getElementById('abort-edit').addEventListener('click', () => switchForms());
});

// Calls createTodo for the given item and adds the returned li to the given list
function addTodo(list, item) {
    const li = createTodo(item);
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
    li.addEventListener('dragstart', ev => ev.dataTransfer.setData('text/plain', item.id));
    // li.addEventListener('dragEnd')
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

// Creates a li-element for the given todo
function createTodo(item) {
    const li = document.createElement('li');
    const text = document.createElement('span');
    li.id = item.id;
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

// Prints the given data as todos into the ul#todoList OR updates the existing data by overriding existing li-elements
function printItems(data, update=false) {
    const todoList = document.getElementById('todo-list');
    for (i=0; i < data.length; i++) {
        if (update) {
            const oldLi = todoList.children[i];
            if (oldLi.id !== data[i].id) {
                const newLi = createTodo(data[i]);
                oldLi.outerHTML = newLi;
            }
        }
        else addTodo(todoList, data[i]);
    }
}

// Checks if the given li elements represent the same todo. This is checked first by id, then by completion state, then by title
function sameTodo(li1, li2) {
    if (li1.id !== li2.id) return false;
    else if (li1.classList.contains('done') !== li2.classList.classList.contains('done'))
        return false;

    const span1 = li1.getElementsByTagName('span')[0];
    const span2 = li2.getElementsByTagName('span')[0];
    return span1.textContent === span2.textContent;
}

// Sets the todo-form hidden and the edit-form unhidden an vise versa
function switchForms() {
    document.getElementById('todo-form').classList.toggle('hidden');
    document.getElementById('edit-form').classList.toggle('hidden');
    document.getElementById('todo-input').value = "";
    document.getElementById('edit-input').value = "";
}

// Does a PUT request with the given item and updates the list after response
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
        const li = document.getElementById(data['id']);
        if (data['title']) {
            const span = li.getElementsByTagName('span')[0];
            span.textContent = data['title'];
        }
        if (data['done'])
            li.classList.add('done');
        else li.classList.remove('done');
        if (editFormActive)
            switchForms();
    });
}