<?php
header("Content-Type: application/json");

switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get Todos (READ)
        break;
    case 'POST':
        // Add todo (CREATE)
        break;
    case 'PUT':
        // Change todo (UPDATE)
        break;
    case 'DELETE':
        // Remove todo (DELETE)
        break;
}