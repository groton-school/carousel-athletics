<?php

use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;

require __DIR__ . '/../../../vendor/autoload.php';

session_id('shared');
session_start();
header('Content-Type', 'application/json');
echo json_encode([
    'ready' => !!SKY::getToken($_SERVER, $_SESSION, $_GET, false),
]);
