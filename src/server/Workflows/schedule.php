<?php

use GrotonSchool\AthleticsSchedule\Blackbaud\Schedule;
use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;

require __DIR__ . '/../../../vendor/autoload.php';

session_id('shared');
session_start();
date_default_timezone_set('America/New_York');

if (!SKY::isReady($_SERVER, $_SESSION, $_GET)) {
    echo json_encode(['error' => 'not authenticated']);
    exit();
}
echo json_encode(Schedule::get($_GET));
exit();
