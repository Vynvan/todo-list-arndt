<?php

function getPDO() {
    try {
        require_once 'config.php';
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
    $uDone = isset($item['done']);
    $uIx = isset($item['done']);
    $uText = isset($item['title']);
    if ($uDone || $uIx || $uText) {
        $done = $uDone ? " completed=:done" : "";
        $ix = $uIx ? " ix=:ix" : "";
        $text = $uText ? " text=:text " : "";
        $pdo = getPDO();
        $stmt = $pdo->prepare("UPDATE todos SET" . $done . ($done && $uIx ? ", " : "") . $ix . (($done || $uIx) && $text ? ", " : "") . $text . "WHERE id=:id");
        $result = $stmt->execute(["id" => $item['id'], "text" => $item['title'], "ix" => $item['ix'], "done" => ($item['done'])]);
        return $result;
    }
}

function updateTodos($items) {
    $count = 0;
    $result = array();
    foreach ($items as $item) {
        $result[$count] = updateTodo($item);
        $count++;
    }
    return $result;
}