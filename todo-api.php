<?php
header("Content-Type: application/json");

function write_log($action, $data) {
    $log = fopen('log.txt', 'a');
    $timestamp = date('Y-m-d H:i:s');
    fwrite($log, "$timestamp - $action: " . json_encode($data) . "\n");
    fclose($log);
}

switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get Todos (READ)
        $todos = [
            ["id" => "uniqueId", "title" => "First TODO"]
        ];
        echo json_encode($todos);
        write_log("READ", null);
        break;
    case 'POST':
        // Add todo (CREATE)
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