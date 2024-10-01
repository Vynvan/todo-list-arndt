const apiUrl = "todo-api.php";
let editListener = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // Define the URL to our PHP API
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const todoList = document.getElementById('todo-list');
        data.forEach(item => {
            addTodo(todoList, item);
        });
    });

    // Add listener that posts the new entry of the todo-form
    document.getElementById('todo-form').addEventListener('submit', e => {
        e.preventDefault();
        const todoInput = document.getElementById('todo-input').value;
        fetch(apiUrl, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
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

function addTodo(list, item) {
    const li = document.createElement('li');
    const text = document.createElement('span');
    li.id = item.id;
    if (item.done)
        li.classList.add('done');
    text.textContent = item.title;
    li.appendChild(text);
    addDoneButton(li, item);
    addEditButton(li, item);
    addDeleteButton(li, item);
    list.appendChild(li);
}

function addDeleteButton(li, item) {
    const button = document.createElement('button');
    button.addEventListener('click', () => {
        fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: item.id })
        })
        .then(response => response.json())
        .then(data => {
            const li = document.getElementById(data['id']);
            li.remove();
        });
    });
    button.classList.add('del-btn');
    button.innerHTML = 'Entfernen';
    li.appendChild(button);
}

function addDoneButton(li, item) {
    const button = document.createElement('button');
    button.addEventListener('click', () => {
        item.done = !li.classList.contains('done');
        updateItem(item, false);
    });
    button.classList.add('done-btn');
    button.innerHTML = 'Erledigt';
    li.appendChild(button);
}

function addEditButton(li, item) {
    const button = document.createElement('button');
    button.addEventListener('click', () => {
        switchForms();
        document.getElementById('edit-input').value = item.title;
        const editForm = document.getElementById('edit-form');
        editForm.removeEventListener('submit', editListener);
        editListener = (ev) => {
            ev.preventDefault();
            item.title = document.getElementById('edit-input').value;
            updateItem(item, true);
        }
        editForm.addEventListener('submit', editListener);
    });
    button.classList.add('edit-btn');
    button.innerHTML = 'Bearbeiten';
    li.appendChild(button);
}

function updateItem(item, editFormActive=false) {
    fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
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

function switchForms() {
    document.getElementById('todo-form').classList.toggle('hidden');
    document.getElementById('edit-form').classList.toggle('hidden');
    document.getElementById('todo-input').value = "";
    document.getElementById('edit-input').value = "";
}