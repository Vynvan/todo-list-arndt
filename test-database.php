<?php
 
$host = '127.0.0.1';
$db = 'todolist';
$user = 'todo-user';
$pass = '0677';
$charset = 'utf8mb4';
 
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]; 
 
echo $dsn;
 
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    var_dump ($pdo);
} catch (PDOException $e) {
    error_log("PDOException: " . $e->getMessage() . " in "
              . $e->getFile() . " on line " . $e->getLine());
}

$statement = $pdo->query("SELECT * from todos");
$items = $statement->fetchAll();

echo "<br><br><br>";
foreach ($items as $item) {
    echo "TODO: " . $item['text'] . " ix: " . $item['ix'] . "<br>";
}

echo "<br><br><br>";
$insert = $pdo->prepare("INSERT INTO todos (text, ix, userid) VALUES (:text, :ix, :userid)");
$result = $insert->execute(["text" => 'PDO benutzen', "ix" => (end($items)['ix'] ?? -1) + 1, "userid" => 1]);

var_dump($result);