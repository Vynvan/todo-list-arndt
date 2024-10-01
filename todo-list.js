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
        });
    });

    document.getElementById('abort-edit').addEventListener('click', () => switchForms());
});

function addTodo(list, item) {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = item.title;
    li.id = item.id;
    li.appendChild(text);
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

function addEditButton(li, item) {
    const button = document.createElement('button');
    button.addEventListener('click', () => {
        switchForms();
        document.getElementById('edit-input').value = item.title;
        const editForm = document.getElementById('edit-form');
        editForm.removeEventListener('submit', editListener);
        editListener = (ev) => {
            ev.preventDefault();
            updateItem(item, true);
        }
        editForm.addEventListener('submit', editListener);
    });
    button.classList.add('edit-btn');
    button.innerHTML = 'Bearbeiten';
    li.appendChild(button);
}

function updateItem(item, editFormActive=false) {
    const title = document.getElementById('edit-input').value;
    fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: item.id, title: title })
    })
    .then(response => response.json())
    .then(data => {
        const li = document.getElementById(data['id']);
        const span = li.getElementsByTagName('span')[0];
        span.textContent = data['title'];
        if (editFormActive)
            switchForms();
    });
}

function switchForms() {
    document.getElementById('todo-form').classList.toggle('hidden');
    document.getElementById('edit-form').classList.toggle('hidden');
    document.getElementById('edit-input').value = "";
}