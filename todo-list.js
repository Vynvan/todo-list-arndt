document.addEventListener('DOMContentLoaded', () => {

    // Define the URL to our PHP API
    const apiUrl = "todo-api.php";
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const todoList = document.getElementById('todo-list');
        data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.title;
            todoList.appendChild(li);
        });
    });

});