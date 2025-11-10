<?php

use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;

require __DIR__ . '/../../../vendor/autoload.php';

session_id('shared');
session_start();
date_default_timezone_set('America/New_York');

header('Content-Type', 'application/json');

echo json_encode([
    'ready' => !!SKY::getToken($_SERVER, $_SESSION, $_GET, false),
]);
