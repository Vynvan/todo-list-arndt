<?php
require_once 'config.php';

function getPDO() {
    global $host, $db, $charset, $user, $pass;
    try {
        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ];
        $pdo = new PDO($dsn, $user, $pass, $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("PDOException: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
        return null;
    }
}

function getAll() {
    $pdo = getPDO();
    $stmt = $pdo->query("SELECT id, text AS title, completed AS done, ix FROM todos WHERE userid=1 ORDER BY ix");
    $items = $stmt->fetchAll();
    return $items;
}

function insertTodo($item) {
    $pdo = getPDO();
    $stmt = $pdo->prepare("INSERT INTO todos (text, ix, userid) VALUES (:text, :ix, :userid)");
    $result = $stmt->execute(["text" => $item['title'], "ix" => $item['ix'], "userid" => 1]);
    return $result;
}

function deleteTodo($item) {
    $pdo = getPDO();
    $stmt = $pdo->prepare("DELETE FROM todos WHERE id=:id");
    $result = $stmt->execute(["id" => $item['id']]);
    return $result;
}

function updateTodo($item) {
    try {
        $query = "UPDATE todos SET ";
        $setParts = [];
        $values = array("id" => $item['id']);
        if (isset($item['done'])) {
            $setParts[] = "completed=:done";
            $values["done"] = $item['done'];
        }
        if (isset($item['ix'])) {
            $setParts[] = "ix=:ix";
            $values["ix"] = $item['ix'];
        }
        if (isset($item['title'])) {
            $setParts[] = "text=:title";
            $values["title"] = $item['title'];
        }

        if (count($setParts) > 0) {
            $query .= implode(', ', $setParts);
            $query .= " WHERE id=:id";
        }
        else return false;

        $pdo = getPDO();
        $stmt = $pdo->prepare($query);
        return $stmt->execute($values);
    }
    catch (Exception $e) {
        error_log($e->getMessage() . json_encode($item));
        return false;
    }
}

function updateTodos($items) {
    $count = 0;
    $result = array();
    foreach ($items as $el) {
        $result[$count] = updateTodo($el);
        $count++;
    }
    return $result;
}