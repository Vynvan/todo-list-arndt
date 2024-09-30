<?php
header("Content-Type: application/json");

function write_log($action, $data) {
    $log = fopen('log.txt', 'a');
    $timestamp = date('Y-m-d H:i:s');
    fwrite($log, "$timestamp - $action: " . json_encode($data) . "\n");
    fclose($log);
}

// Read content of the file and decode JSON data to an array.
$todo_file = 'todos.json';
$todo_items = json_decode(file_get_contents($todo_file), true);

switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get Todos (READ):
        echo json_encode($todo_items);
        write_log("READ", null);
        break;
    case 'POST':
        // Add todo (CREATE):
        $data = json_decode(file_get_contents('php://input'), true); // Get data from the input stream
        $new_todo = ["id" => uniqid(), "title" => $data['title']]; // Create new todo item
        $todo_items[] = $new_todo; // Add new item to our todo item list
        file_put_contents($todo_file, json_encode($todo_items)); // Write todo items to JSON file
        echo json_encode($new_todo); // Return the new item
        write_log("CREATE", null);
        break;
    case 'PUT':
        // Change todo (UPDATE)
        write_log("UPDATE", null);
        break;
    case 'DELETE':
        // Remove todo (DELETE)
        write_log("DELETE", null);
        break;
}