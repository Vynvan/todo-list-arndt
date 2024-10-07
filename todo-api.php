<?php
header("Content-Type: application/json");

$todo_file = 'todos.json';
$todo_items = json_decode(file_get_contents($todo_file), true);
usort($todo_items, "sortByIx");

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
        $new_todo = ["id" => uniqid(), "title" => $data['title'], "ix" => $ix, "userid" => 1];
        $todo_items[] = $new_todo;
        file_put_contents($todo_file, json_encode($todo_items));
        echo json_encode($new_todo);
        write_log("CREATE", $new_todo);
        break;
    case 'PUT':
        // Change todo (UPDATE):
        $data = json_decode(file_get_contents('php://input'), true);
        $toUpdate = $data['id'];
        $todo_id = getById($todo_items, $toUpdate);
        if ($todo_id !== null) {
            if (isset($data['title'])) {
                $todo_items[$todo_id]['title'] = $data['title'];
            }
            if (isset($data['done'])) {
                if ($data['done'] === true) $todo_items[$todo_id]['done'] = true;
                else unset($todo_items[$todo_id]['done']);
                // $todo_items[$todo_id]['done'] = $data['done'];
            }
            if (isset($data['ix'])) {
                $todo_items[$todo_id]['ix'] = $data['ix'];
            }
            file_put_contents($todo_file, json_encode($todo_items));
            echo json_encode($data);
            write_log("UPDATE", $data);
        }
        else echo json_encode(array("error" => "Fehler: Todo nicht gefunden $toUpdate => $todo_id"));
        break;
    case 'DELETE':
        // Remove todo (DELETE):
        $data = json_decode(file_get_contents('php://input'), true);
        $toUpdate = $data['id'];
        $todo_id = getById($todo_items, $toUpdate);
        if ($todo_id != null) {
            unset($todo_items[$todo_id]);
            file_put_contents($todo_file, json_encode($todo_items));
            echo json_encode($data);
            write_log("DELETE", $data);
        }
        else echo json_encode(array("error" => "Fehler: Todo nicht gefunden $toUpdate => $todo_id"));
        break;
}


function getById($array, $id) {
    foreach ($array as $key => $val) {
        if ($val['id'] === $id) {
            return $key;
        }
    }
    return null;
}

function sortByIx($item1, $item2) {
    return $item1['ix'] - $item2['ix'];
}

function write_log($action, $data) {
    $log = fopen('log.txt', 'a');
    $timestamp = date('Y-m-d H:i:s');
    fwrite($log, "$timestamp - $action: " . json_encode($data) . "\n");
    fclose($log);
}