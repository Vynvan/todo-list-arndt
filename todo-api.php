<?php
require_once "./classes/TodoDB.php";
header("Content-Type: application/json");

$todoDb = new TodoDB();
$todo_items = $todoDb->getTodos();

switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get Todos (READ):
        echo json_encode($todo_items);
        write_log("READ", count($todo_items));
        break;
    case 'POST':
        // Add todo (CREATE):
        $data = json_decode(file_get_contents('php://input'), true);
        $ix = (end($todo_items)['ix'] ?? -1) + 1;
        $new_todo = ["title" => $data['title'], "ix" => $ix];
        $new_todo['result'] = $todoDb->createTodo($new_todo);
        echo json_encode($new_todo);
        write_log("CREATE", $new_todo);
        break;
    case 'PUT':
        // Change todo (UPDATE):
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['items'])) $data['result'] = $todoDb->updateTodos($data['items']);
        else $data['result'] = $todoDb->updateTodo($data);
        echo json_encode($data);
        write_log("UPDATE", $data);
        break;
    case 'DELETE':
        // Remove todo (DELETE):
        $data = json_decode(file_get_contents('php://input'), true);
        $data['result'] = $todoDb->deleteTodo($data['id']);
        echo json_encode($data);
        write_log("DELETE", $data);
        break;
}


function write_log($action, $data) {
    $log = fopen('log.txt', 'a');
    $timestamp = date('Y-m-d H:i:s');
    fwrite($log, "$timestamp - $action: " . json_encode($data) . "\n");
    fclose($log);
}