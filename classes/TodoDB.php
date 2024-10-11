<?php

require_once('./config.php');


/**
 * Database handling for the todos in the FI36 demo project.
 *
 * All database functionality is defined here.
 *
 * @author  Matthias Arndt
 * @property object $connection PDO connection to the MariaDB
 * @property object $stmt Database statement handler object.
 */
class TodoDB {
    private $connection;
    private $stmt;

    /**
     * Constructor of the TodoDB class.
     */
    public function __construct() {
        global $host, $db, $charset, $user, $pass;
        try {
            $this->connection = new PDO("mysql:host=$host;dbname=$db;charset=$charset", $user, $pass);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        }
        catch (Exception $e) {
            error_log($e->getMessage());
        }
    }

    /**
     * Prepare and execute the given sql statement.
     *
     * @param string $sql The sql statement.
     * @param array $params An array of the needed parameters.
     * @return object $stmt The excecuted statement.
     */
    private function prepareExecuteStatement($sql, $params = []) {
        try {
            $this->stmt = $this->connection->prepare($sql);
            return $this->stmt->execute($params);
        }
        catch(Exception $e) {
            error_log($e->getMessage());
            return $e->getMessage();
        }
    }

    /**
     * Returns all todolist items for the given user
     *
     * @return array $todo_items Liste von Todoeinträgen
     */
    public function getTodos() {
        $this->stmt = $this->connection->query("SELECT id, text AS title, completed AS done, ix FROM todos WHERE userid=1 ORDER BY ix");
        return $this->stmt->fetchAll();
    }

    /**
     * Creates a new todo item with the given data
     *
     * @param array $item An array holding the item data. Required: id; Optional: done, ix, title
     * @return boolean True if the database operation succeeded
     */
    public function createTodo($item) {
        $sql = "INSERT INTO todos (text, ix, userid) VALUES (:text, :ix, :userid)";
        $values = ["text" => $item['title'], "ix" => $item['ix'], "userid" => 1];
        return $this->prepareExecuteStatement($sql, $values);
    }

    /**
     * Deletes the todo item with the given id
     */
    function deleteTodo($id) {
        $sql = "DELETE FROM todos WHERE id=:id";
        $values = ["id" => $id];
        return $this->prepareExecuteStatement($sql, $values);
    }

    /**
     * Updates the todolist item by transfering the given item data to the database
     * 
     * @param array $item An array holding the item data. Required: id; Optional: done, ix, title
     * @return boolean True if the database operation succeeded
     */
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
    
            return $this->prepareExecuteStatement($query, $values);
        }
        catch (Exception $e) {
            error_log($e->getMessage() . json_encode($item));
            return false;
        }
    }
    
    /**
     * Calls the updateTodo function for each given todo item
     * 
     * @param array $items
     * @return array An array of booleans representing the updateTodo return values
     */
    function updateTodos($items) {
        $count = 0;
        $result = array();
        foreach ($items as $el) {
            $result[$count] = $this->updateTodo($el);
            $count++;
        }
        return $result;
    }
}