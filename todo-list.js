const apiUrl = "todo-api.php";

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
});

function addTodo(list, item) {
    const li = document.createElement('li');
    li.id = item.id;
    li.textContent = item.title;
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
    button.innerHTML = 'Entfernen';
    li.appendChild(button);
}

function addEditButton(li, item) {
    const button = document.createElement('button');
    button.addEventListener('click', () => {
        const todoForm = document.getElementById('todo-form');
        const editForm = document.getElementById('edit-form');
        todoForm.classList.toggle('hidden');
        editForm.classList.toggle('hidden');
    });
    button.innerHTML = 'Bearbeiten';
    li.appendChild(button);
}