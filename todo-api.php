<?php
header("Content-Type: application/json");

function write_log($action, $data) {
    $log = fopen('log.txt', 'a');
    $timestamp = date('Y-m-d H:i:s');
    fwrite($log, "$timestamp - $action: " . json_encode($data) . "\n");
    fclose($log);
}

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
        $data = json_decode(file_get_contents('php://input'), true);
        $new_todo = ["id" => uniqid(), "title" => $data['title']];
        $todo_items[] = $new_todo;
        file_put_contents($todo_file, json_encode($todo_items));
        echo json_encode($new_todo);
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